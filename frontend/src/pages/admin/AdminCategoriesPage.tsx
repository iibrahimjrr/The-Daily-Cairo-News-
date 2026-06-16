import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../../services/api';
import { Category } from '../../types';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  icon: z.string().optional(),
  order: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminService.getCategories().then(r => r.data.data),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { color: '#bb0011' },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => adminService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created!');
      reset();
      setShowForm(false);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create category.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => adminService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated!');
      setEditId(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted.');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Cannot delete category with articles.');
    },
  });

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setValue('name', cat.name);
    setValue('description', cat.description || '');
    setValue('color', cat.color);
    setValue('icon', cat.icon || '');
    setShowForm(false);
  };

  const onSubmit = (data: FormData) => {
    if (editId) {
      updateMutation.mutate({ id: editId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const categories: Category[] = data || [];

  return (
    <>
      <Helmet><title>Categories — Admin Dashboard</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-headline-lg">Categories</h1>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); reset(); }} className="btn-primary flex items-center gap-2 text-sm">
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Cancel' : 'New Category'}
          </button>
        </div>

        {/* Create form */}
        {(showForm || editId !== null) && (
          <div className="island-card p-6">
            <h2 className="font-serif text-headline-md mb-5">{editId ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Name *</label>
                  <input
                    {...register('name')}
                    placeholder="Category name"
                    className="w-full px-4 py-2.5 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline"
                  />
                  {errors.name && <p className="font-sans text-xs text-secondary mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Color *</label>
                  <div className="flex gap-2">
                    <input
                      {...register('color')}
                      type="color"
                      className="w-12 h-10 border border-outline-variant/40 rounded-lg cursor-pointer bg-transparent"
                    />
                    <input
                      {...register('color')}
                      placeholder="#bb0011"
                      className="flex-1 px-4 py-2.5 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline font-mono"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Description</label>
                  <input
                    {...register('description')}
                    placeholder="Brief description"
                    className="w-full px-4 py-2.5 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex items-center gap-2 text-sm">
                  <Check size={15} /> {editId ? 'Update' : 'Create'} Category
                </button>
                <button type="button" onClick={() => { setEditId(null); setShowForm(false); reset(); }} className="btn-ghost text-sm py-2 px-4">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="island-card p-5 animate-pulse">
                <div className="w-10 h-10 bg-surface-container rounded-full mb-3" />
                <div className="h-5 bg-surface-container rounded w-1/2 mb-2" />
                <div className="h-4 bg-surface-container rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className={`island-card p-5 ${editId === cat.id ? 'ring-2 ring-secondary' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + '30' }}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(cat)} className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id);
                      }}
                      className="p-1.5 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-serif text-base font-medium text-on-surface mb-1">{cat.name}</h3>
                {cat.description && (
                  <p className="font-sans text-xs text-on-surface-variant mb-3 line-clamp-2">{cat.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-outline-variant/20">
                  <span
                    className="category-badge text-white text-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name}
                  </span>
                  {(cat as Category & { published_articles_count?: number }).published_articles_count !== undefined && (
                    <span className="font-sans text-xs text-on-surface-variant ml-auto">
                      {(cat as Category & { published_articles_count?: number }).published_articles_count} articles
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
