/**
 * Lightweight native IndexedDB Client for Offline Educational Platform
 * Stores offline local copy of Curriculum (14 lessons) and Question Bank (729 questions).
 * Does NOT store student management / user tracking data.
 */

const DB_NAME = "EgyptianAICurriculumDB";
const DB_VERSION = 1;

export const EXPECTED_LESSONS_COUNT = 14;
export const EXPECTED_QUESTIONS_COUNT = 281;
export const EXPECTED_IMAGES_COUNT = 48;
export const CURRENT_CONTENT_VERSION = "2026.09.11";

export interface OfflineLessonRecord {
  lessonId: string;
  chapterId: string;
  title: string;
  number: string;
  slug: string;
  data: any;
}

export interface OfflineQuestionRecord {
  id: string;
  lessonId: string;
  chapterId: string;
  type: string;
  questionData: any;
}

export interface OfflineMetadataRecord {
  key: string;
  version: string;
  downloadedAt: string;
  totalLessons: number;
  totalQuestions: number;
  totalImages: number;
  sizeBytes?: number;
}

class OfflineDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("IndexedDB is not available in SSR"));
    }

    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store 1: Curriculum Lessons
        if (!db.objectStoreNames.contains("curriculum")) {
          const curriculumStore = db.createObjectStore("curriculum", { keyPath: "lessonId" });
          curriculumStore.createIndex("chapterId", "chapterId", { unique: false });
        }

        // Store 2: Questions Bank
        if (!db.objectStoreNames.contains("questions")) {
          const questionStore = db.createObjectStore("questions", { keyPath: "id" });
          questionStore.createIndex("lessonId", "lessonId", { unique: false });
          questionStore.createIndex("chapterId", "chapterId", { unique: false });
        }

        // Store 3: Content Metadata
        if (!db.objectStoreNames.contains("contentMetadata")) {
          db.createObjectStore("contentMetadata", { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // Save all curriculum lessons
  public async saveLessons(lessons: OfflineLessonRecord[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("curriculum", "readwrite");
      const store = tx.objectStore("curriculum");
      lessons.forEach((l) => store.put(l));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Get a single lesson by ID
  public async getLesson(lessonId: string): Promise<OfflineLessonRecord | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("curriculum", "readonly");
      const store = tx.objectStore("curriculum");
      const req = store.get(lessonId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  // Get all cached lessons
  public async getAllLessons(): Promise<OfflineLessonRecord[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("curriculum", "readonly");
      const store = tx.objectStore("curriculum");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // Save question bank
  public async saveQuestions(questions: OfflineQuestionRecord[]): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("questions", "readwrite");
      const store = tx.objectStore("questions");
      questions.forEach((q) => store.put(q));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Get questions for a lesson
  public async getQuestionsByLesson(lessonId: string): Promise<OfflineQuestionRecord[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("questions", "readonly");
      const store = tx.objectStore("questions");
      const idx = store.index("lessonId");
      const req = idx.getAll(lessonId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  // Save metadata (version, downloaded timestamp, counts)
  public async saveMetadata(metadata: OfflineMetadataRecord): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("contentMetadata", "readwrite");
      const store = tx.objectStore("contentMetadata");
      store.put(metadata);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Get metadata
  public async getMetadata(): Promise<OfflineMetadataRecord | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("contentMetadata", "readonly");
      const store = tx.objectStore("contentMetadata");
      const req = store.get("current_version");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  // Get actual physical counts from IndexedDB
  public async getLessonsCount(): Promise<number> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("curriculum", "readonly");
      const store = tx.objectStore("curriculum");
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  }

  public async getQuestionsCount(): Promise<number> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("questions", "readonly");
      const store = tx.objectStore("questions");
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  }

  // Check if offline pack is fully downloaded and physically verified
  public async isOfflinePackReady(): Promise<boolean> {
    try {
      const meta = await this.getMetadata();
      if (!meta || meta.version !== CURRENT_CONTENT_VERSION) return false;
      const lessonCount = await this.getLessonsCount();
      const questionCount = await this.getQuestionsCount();
      return lessonCount === EXPECTED_LESSONS_COUNT && questionCount === EXPECTED_QUESTIONS_COUNT;
    } catch {
      return false;
    }
  }

  // Clear offline cache if needed
  public async clearAll(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["curriculum", "questions", "contentMetadata"], "readwrite");
      tx.objectStore("curriculum").clear();
      tx.objectStore("questions").clear();
      tx.objectStore("contentMetadata").clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const offlineDB = new OfflineDatabase();
