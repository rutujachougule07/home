import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { collection, doc, onSnapshot, writeBatch, getDocs } from "firebase/firestore";
import { db, auth } from "../pages/firebase";

export type Role = "superadmin" | "manager" | "employee";

export interface User { id: string; name: string; username: string; role: Role; email?: string; phone?: string; employeeId?: string; jobTitle?: string; password?: string; address?: string; status?: string; }
export interface Product { id: string; name: string; category: string; price: number; stock: number; status: string; sku: string; image: string; qty: number; cost: number; incentive: number; supplier: string; date: string; warranty?: string; brand?: string; location?: "Shop" | "Godown 1" | "Godown 2" | "Display"; assignedEmployeeId?: string; incentiveSeen?: boolean; }
export interface Customer { id: string; name: string; email: string; phone: string; address: string; status: string; }
export interface Order { id: string; customerId: string; customerName: string; productId: string; productName: string; qty: number; total: number; discount?: number; createdBy: string; status: "Pending" | "Approved" | "Rejected" | "Delivered"; date: string; assignedTo?: string; assignedToName?: string; sentToEmployee?: boolean; customerBargain?: string; docType?: "Bill" | "Order Copy"; bookingExpiryDate?: string; isIncentive?: boolean; }
export interface Task { id: string; title: string; assignedTo: string; assignedToName: string; customerId?: string; status: "Pending" | "In Progress" | "Completed"; date: string; proofNote?: string; proofUrl?: string; }
export interface Notification { id: string; to: Role | "all"; from: string; message: string; date: string; read: boolean; }
export interface Lead { id: string; name: string; phone: string; email?: string; source?: string; product?: string; brand?: string; gender?: "Male" | "Female" | "Other"; status: "New" | "Cold" | "Warm" | "Hot" | "Enrolled" | "Cancelled"; followUpDate?: string; notes?: string; date: string; assignedTo?: string; city?: string; createdBy?: string; }

interface State {
  currentUser: User | null;
  users: User[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  tasks: Task[];
  notifications: Notification[];
  leads: Lead[];
}

const initialUsers: User[] = [
  { id: "u1", name: "Super Admin", username: "admin@gmail.com", role: "superadmin", email: "admin@gmail.com", password: "admin123" },
  { id: "u2", name: "Rohan Patil", username: "manager@gmail.com", role: "manager", email: "manager@gmail.com", phone: "9876543210", employeeId: "MGR001", jobTitle: "Store Manager", password: "manager123", address: "Kothrud, Pune", status: "Verified" },
];

const initialProducts: Product[] = [];
const initialCustomers: Customer[] = [];
const initialOrders: Order[] = [];
const initialTasks: Task[] = [];
const initialNotifications: Notification[] = [];
const initialLeads: Lead[] = [];

const USER_STORAGE_KEY = "sham_current_user_v2";

function loadCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    let raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) raw = sessionStorage.getItem(USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  return null;
}

function saveCurrentUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch { }
}

function defaultState(): State {
  return {
    currentUser: loadCurrentUser(),
    users: [],
    products: [],
    customers: [],
    orders: [],
    tasks: [],
    notifications: [],
    leads: [],
  };
}

const PASSWORDS: Record<string, { password: string; role: Role }> = {
  "admin@gmail.com": { password: "admin123", role: "superadmin" },
  "manager@gmail.com": { password: "manager123", role: "manager" },
  "employee@gmail.com": { password: "employee123", role: "employee" },
};

const sanitizeDoc = (obj: any) => {
  const clean: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean;
};

const syncCollection = async (
  colName: string,
  oldList: any[] = [],
  newList: any[] = []
) => {
  const oldMap = new Map(oldList.map((item) => [item.id, item]));
  const newMap = new Map(newList.map((item) => [item.id, item]));

  const batch = writeBatch(db);
  let hasChanges = false;

  // Find added or updated items
  for (const newItem of newList) {
    const oldItem = oldMap.get(newItem.id);
    if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
      const docRef = doc(db, colName, newItem.id);
      const cleanItem = sanitizeDoc(newItem);
      batch.set(docRef, cleanItem);
      hasChanges = true;
    }
  }

  // Find deleted items
  for (const oldItem of oldList) {
    if (!newMap.has(oldItem.id)) {
      const docRef = doc(db, colName, oldItem.id);
      batch.delete(docRef);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    try {
      await batch.commit();
    } catch (err) {
      console.error(`Error syncing collection ${colName} to Firestore:`, err);
      alert(`Database Sync Error (${colName}): ${err instanceof Error ? err.message : String(err)}`);
    }
  }
};

const syncStateToFirestore = (oldState: State, newState: State) => {
  const collections: (keyof Omit<State, "currentUser">)[] = [
    "users",
    "products",
    "customers",
    "orders",
    "tasks",
    "notifications",
    "leads",
  ];

  collections.forEach((col) => {
    syncCollection(col, oldState[col], newState[col]);
  });
};

const seedDatabase = async () => {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    if (usersSnap.empty) {
      console.log("Firestore users collection is empty. Seeding initial data...");
      const collectionsToSeed = {
        users: initialUsers,
        products: initialProducts,
        customers: initialCustomers,
        orders: initialOrders,
        tasks: initialTasks,
        notifications: initialNotifications,
      };

      for (const [colName, dataList] of Object.entries(collectionsToSeed)) {
        const batch = writeBatch(db);
        for (const item of dataList) {
          const docRef = doc(db, colName, item.id);
          batch.set(docRef, item);
        }
        await batch.commit();
      }
      console.log("Firestore seeding completed successfully.");
    }
  } catch (err) {
    console.error("Error seeding Firestore:", err);
  }
};

export const StoreContext = createContext<(State & { login: (username: string, password: string) => Promise<Role | null>; logout: () => void; setState: (updater: (s: State) => State) => void; uid: (prefix: string) => string; }) | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [state, setStateRaw] = useState<State>(() => defaultState());

  useEffect(() => {
    setIsMounted(true);
    // 2. Seed database and subscribe to collections
    seedDatabase().then(() => {
      const unsubscribers = [
        onSnapshot(collection(db, "users"), (snap) => {
          const list = snap.docs
            .map((d) => d.data() as User)
            .filter((u) => u.id !== "u3" && u.id !== "u5" && u.id !== "u4" && u.username !== "employee@gmail.com" && u.username !== "employee2");
          setStateRaw((s) => ({ ...s, users: list }));
        }),
        onSnapshot(collection(db, "products"), (snap) => {
          const list = snap.docs.map((d) => d.data() as Product);
          setStateRaw((s) => ({ ...s, products: list }));
        }),
        onSnapshot(collection(db, "customers"), (snap) => {
          const list = snap.docs.map((d) => d.data() as Customer);
          setStateRaw((s) => ({ ...s, customers: list }));
        }),
        onSnapshot(collection(db, "orders"), (snap) => {
          const list = snap.docs.map((d) => d.data() as Order);
          setStateRaw((s) => ({ ...s, orders: list }));
        }),
        onSnapshot(collection(db, "tasks"), (snap) => {
          const list = snap.docs.map((d) => d.data() as Task);
          setStateRaw((s) => ({ ...s, tasks: list }));
        }),
        onSnapshot(collection(db, "notifications"), (snap) => {
          const list = snap.docs.map((d) => d.data() as Notification);
          setStateRaw((s) => ({ ...s, notifications: list }));
        }),
        onSnapshot(collection(db, "leads"), (snap) => {
          const list = snap.docs.map((d) => d.data() as Lead);
          setStateRaw((s) => ({ ...s, leads: list }));
        }),
      ];

      return () => {
        unsubscribers.forEach((unsub) => unsub());
      };
    });
  }, []);

  const prevStateRef = useRef<State>(state);

  useEffect(() => {
    saveCurrentUser(state.currentUser);
  }, [state.currentUser]);

  useEffect(() => {
    const prev = prevStateRef.current;
    if (prev !== state) {
      // Sync the difference asynchronously
      syncStateToFirestore(prev, state);
      prevStateRef.current = state;
    }
  }, [state]);

  const setState = (updater: (s: State) => State) => {
    setStateRaw((prev) => {
      prevStateRef.current = prev;
      return updater(prev);
    });
  };

  const login = async (username: string, password: string): Promise<Role | null> => {
    const searchVal = username.trim().toLowerCase();

    // 1. Try Firebase Authentication first
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const userCredential = await signInWithEmailAndPassword(auth, username.trim(), password);
      const authUser = userCredential.user;

      if (authUser) {
        // Find user by email in Firestore
        let user = state.users.find((u) => u.email?.toLowerCase().trim() === searchVal) ?? null;

        if (!user) {
          // If not found in Firestore, let's create a new user profile dynamically
          const isSuperAdmin = searchVal === "admin@gmail.com";
          const isManager = searchVal.includes("manager");
          const role: Role = isSuperAdmin ? "superadmin" : (isManager ? "manager" : "employee");

          user = {
            id: authUser.uid,
            name: isSuperAdmin ? "Super Admin" : (isManager ? "Manager" : "Employee"),
            username: searchVal,
            email: searchVal,
            role: role,
            password: password, // Store password so local check works next time
            status: "Verified"
          };

          // Add user to state and sync to Firestore
          setState((s) => ({
            ...s,
            users: [...s.users, user!]
          }));
        }

        setState((s) => ({ ...s, currentUser: user }));
        return user.role;
      }
    } catch (authError) {
      console.warn("Firebase Auth login failed, checking Firestore fallback:", authError);
    }

    // 2. Fallback to Firestore/Local credentials check
    const user = state.users.find((u) =>
      (u.username && u.username.toLowerCase().trim() === searchVal) ||
      (u.email && u.email.toLowerCase().trim() === searchVal) ||
      (u.employeeId && u.employeeId.toLowerCase().trim() === searchVal)
    ) ?? null;

    if (user) {
      // If user has a password in Firestore, verify it
      if (user.password && user.password === password) {
        setState((s) => ({ ...s, currentUser: user }));
        return user.role;
      }

      // Fallback: If user password is not in Firestore but is in PASSWORDS config
      const entry = PASSWORDS[searchVal];
      if (entry && entry.password === password) {
        setState((s) => ({ ...s, currentUser: user }));
        return entry.role;
      }
    }

    return null;
  };

  const logout = () => setState((s) => ({ ...s, currentUser: null }));

  const uid = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 8)}`;

  if (!isMounted) return null;

  return (
    <StoreContext.Provider value={{ ...state, login, logout, setState, uid }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}