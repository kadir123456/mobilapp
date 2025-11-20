
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { 
  doc, setDoc, getDoc, serverTimestamp, collection, addDoc, 
  query, getDocs, orderBy, runTransaction, increment 
} from "firebase/firestore";
import { auth, db } from './config';
import type { MatchAnalysis, BetType, AnalysisHistoryItem } from '../types';


export const signUpWithEmail = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Yeni kullanıcı için Firestore'da bir doküman oluştur
  await createUserDocument(user);
  return user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOutUser = () => {
  return signOut(auth);
};

export const onAuthUserChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const createUserDocument = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { email } = user;
    const createdAt = serverTimestamp();
    try {
      await setDoc(userRef, {
        email,
        createdAt,
        credits: 5, // Yeni kullanıcıya 5 başlangıç kredisi
        totalSpent: 0,
      });
    } catch (error) {
      console.error("Error creating user document: ", error);
    }
  }
};

export const getUserDocument = async (uid: string) => {
    if (!uid) return null;
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);
    return userSnapshot.exists() ? userSnapshot.data() : null;
};

export const deductCredit = async (uid: string): Promise<void> => {
  const userRef = doc(db, "users", uid);
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw "Kullanıcı bulunamadı.";
      }
      const currentCredits = userDoc.data().credits;
      if (currentCredits < 1) {
        throw "Yetersiz kredi.";
      }
      transaction.update(userRef, { credits: increment(-1) });
    });
  } catch (error) {
    console.error("Kredi düşürme işlemi başarısız: ", error);
    if (error === "Yetersiz kredi.") {
        throw new Error("Analiz yapmak için yeterli krediniz bulunmuyor.");
    }
    throw new Error("Kredi düşürme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
  }
};

export const saveAnalysisToHistory = async (uid: string, analysisResults: MatchAnalysis[], betType: BetType): Promise<void> => {
  try {
    const historyCollectionRef = collection(db, `users/${uid}/analysisHistory`);
    await addDoc(historyCollectionRef, {
      analysisResults,
      betType,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Analiz geçmişi kaydedilemedi: ", error);
  }
};

export const getAnalysisHistory = async (uid: string): Promise<AnalysisHistoryItem[]> => {
    const historyCollectionRef = collection(db, `users/${uid}/analysisHistory`);
    const q = query(historyCollectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as AnalysisHistoryItem[];
};