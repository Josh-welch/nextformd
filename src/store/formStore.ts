import { create } from 'zustand';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, Timestamp, orderBy, limit, DocumentData } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export type FieldType = 'text' | 'textarea' | 'email' | 'number' | 'select' | 'date' | 'file';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validationEnabled: boolean;
  validation?: string;
  accept?: string;
  maxSize?: number;
}

export interface FormPage {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormDeployment {
  id: string;
  formId: string;
  userId: string;
  slug: string;
  isPublished: boolean;
  version: number;
  responses: number;
  createdAt: number;
  lastPublishedAt?: number;
}

interface FormState {
  pages: FormPage[];
  currentPage: number;
  currentFormId: string | null;
  deployment: FormDeployment | null;
  loading: boolean;
  error: string | null;
  addPage: (page: FormPage) => void;
  updatePageTitle: (pageId: string, title: string) => void;
  removePage: (pageId: string) => void;
  addField: (pageId: string, field: FormField) => void;
  updateField: (pageId: string, fieldId: string, field: FormField) => void;
  removeField: (pageId: string, fieldId: string) => void;
  setCurrentPage: (index: number) => void;
  saveForm: () => Promise<void>;
  loadForm: () => Promise<void>;
  publishForm: () => Promise<void>;
  unpublishForm: () => Promise<void>;
  clearError: () => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  pages: [],
  currentPage: 0,
  currentFormId: null,
  deployment: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  addPage: (page) => {
    set((state) => ({
      pages: [...state.pages, page],
      currentPage: state.pages.length,
      error: null,
    }));
  },

  updatePageTitle: (pageId, title) => {
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === pageId ? { ...page, title } : page
      ),
      error: null,
    }));
  },

  removePage: (pageId) => {
    set((state) => ({
      pages: state.pages.filter((page) => page.id !== pageId),
      currentPage: Math.max(0, state.currentPage - 1),
      error: null,
    }));
  },

  addField: (pageId, field) => {
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === pageId
          ? { ...page, fields: [...page.fields, field] }
          : page
      ),
      error: null,
    }));
  },

  updateField: (pageId, fieldId, updatedField) => {
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              fields: page.fields.map((field) =>
                field.id === fieldId ? updatedField : field
              ),
            }
          : page
      ),
      error: null,
    }));
  },

  removeField: (pageId, fieldId) => {
    set((state) => ({
      pages: state.pages.map((page) =>
        page.id === pageId
          ? {
              ...page,
              fields: page.fields.filter((field) => field.id !== fieldId),
            }
          : page
      ),
      error: null,
    }));
  },

  setCurrentPage: (index) => {
    set({ currentPage: index, error: null });
  },

  saveForm: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'You must be signed in to save forms' });
      return;
    }

    const { pages, currentFormId } = get();
    if (pages.length === 0) {
      set({ error: 'Cannot save an empty form' });
      return;
    }

    try {
      set({ loading: true, error: null });
      const formData = {
        pages,
        userId: user.uid,
        updatedAt: Timestamp.now(),
      };

      if (currentFormId) {
        const formRef = doc(db, 'forms', currentFormId);
        await updateDoc(formRef, formData);
      } else {
        const formsRef = collection(db, 'forms');
        const docRef = await addDoc(formsRef, {
          ...formData,
          createdAt: Timestamp.now(),
        });
        set({ currentFormId: docRef.id });
      }
    } catch (error: any) {
      console.error('Error saving form:', error);
      set({ error: 'Failed to save form' });
    } finally {
      set({ loading: false });
    }
  },

  loadForm: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'You must be signed in to load forms' });
      return;
    }

    try {
      set({ loading: true, error: null });
      
      const formsRef = collection(db, 'forms');
      const formsQuery = query(
        formsRef,
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(formsQuery);
      let formDoc: DocumentData | null = null;

      if (!querySnapshot.empty) {
        formDoc = querySnapshot.docs[0];
        const formData = formDoc.data();

        set({
          pages: formData.pages || [],
          currentFormId: formDoc.id,
          error: null,
        });

        const deploymentsRef = collection(db, 'deployments');
        const deploymentQuery = query(
          deploymentsRef,
          where('formId', '==', formDoc.id),
          where('userId', '==', user.uid),
          limit(1)
        );

        const deploymentSnapshot = await getDocs(deploymentQuery);

        if (!deploymentSnapshot.empty) {
          const deploymentDoc = deploymentSnapshot.docs[0];
          const deploymentData = deploymentDoc.data();

          set({
            deployment: {
              id: deploymentDoc.id,
              formId: formDoc.id,
              userId: user.uid,
              slug: deploymentData.slug,
              isPublished: deploymentData.isPublished || false,
              version: deploymentData.version || 1,
              responses: deploymentData.responses || 0,
              createdAt: deploymentData.createdAt?.toMillis() || Date.now(),
              lastPublishedAt: deploymentData.lastPublishedAt?.toMillis(),
            },
          });
        }
      } else {
        set({
          pages: [],
          currentFormId: null,
          deployment: null,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('Error loading form:', error);
      set({ error: 'Failed to load form' });
    } finally {
      set({ loading: false });
    }
  },

  publishForm: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: 'You must be signed in to publish forms' });
      return;
    }

    const { currentFormId, pages, deployment } = get();
    if (!currentFormId || pages.length === 0) {
      set({ error: 'Cannot publish an empty form' });
      return;
    }

    try {
      set({ loading: true, error: null });

      // Save the form first
      await get().saveForm();

      const deploymentsRef = collection(db, 'deployments');
      let newDeployment;

      if (deployment) {
        // Update existing deployment
        const deploymentRef = doc(db, 'deployments', deployment.id);
        const updateData = {
          isPublished: true,
          version: (deployment.version || 0) + 1,
          lastPublishedAt: Timestamp.now(),
        };
        await updateDoc(deploymentRef, updateData);
        newDeployment = {
          ...deployment,
          ...updateData,
          lastPublishedAt: Date.now(),
        };
      } else {
        // Create new deployment
        const slug = crypto.randomUUID().slice(0, 8);
        const deploymentData = {
          formId: currentFormId,
          userId: user.uid,
          slug,
          isPublished: true,
          version: 1,
          responses: 0,
          createdAt: Timestamp.now(),
          lastPublishedAt: Timestamp.now(),
        };
        const docRef = await addDoc(deploymentsRef, deploymentData);
        newDeployment = {
          id: docRef.id,
          ...deploymentData,
          createdAt: Date.now(),
          lastPublishedAt: Date.now(),
        };
      }

      set({ deployment: newDeployment as FormDeployment });
    } catch (error: any) {
      console.error('Error publishing form:', error);
      set({ error: 'Failed to publish form' });
    } finally {
      set({ loading: false });
    }
  },

  unpublishForm: async () => {
    const { deployment } = get();
    if (!deployment) {
      set({ error: 'No form to unpublish' });
      return;
    }

    try {
      set({ loading: true, error: null });
      const deploymentRef = doc(db, 'deployments', deployment.id);
      await updateDoc(deploymentRef, {
        isPublished: false,
      });

      set({
        deployment: {
          ...deployment,
          isPublished: false,
        },
      });
    } catch (error: any) {
      console.error('Error unpublishing form:', error);
      set({ error: 'Failed to unpublish form' });
    } finally {
      set({ loading: false });
    }
  },
}));