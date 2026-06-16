import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { adminService, categoryService } from '../../services/api';
import { Category } from '../../types';
import {
  Bold, Italic, UnderlineIcon, Strikethrough, List, ListOrdered,
  Quote, Link2, ImageIcon, Heading2, Heading3, ArrowLeft, Save, Eye, Upload, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subtitle: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  category_id: z.string().min(1, 'Please select a category'),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published']),
  is_breaking: z.boolean().optional(),
  is_trending: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll().then(r => r.data.data),
  });

  const { data: articleData } = useQuery({
    queryKey: ['admin-article', id],
    queryFn: () => adminService.getArticle(Number(id)).then(r => r.data.data),
    enabled: isEdit,
  });

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'draft',
      is_breaking: false,
      is_trending: false,
      is_featured: false,
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
      Link.configure({ openOnClick: false }),
      Underline,
      Image,
    ],
    content: '',
  });

  useEffect(() => {
    if (articleData && editor) {
      setValue('title', articleData.title);
      setValue('subtitle', articleData.subtitle || '');
      setValue('excerpt', articleData.excerpt || '');
      setValue('category_id', String(articleData.category?.id || ''));
      setValue('tags', (articleData.tags || []).join(', '));
      setValue('status', articleData.status as 'draft' | 'published');
      setValue('is_breaking', articleData.is_breaking);
      setValue('is_trending', articleData.is_trending);
      setValue('is_featured', articleData.is_featured || false);
      setValue('meta_title', articleData.meta_title || '');
      setValue('meta_description', articleData.meta_description || '');
      editor.commands.setContent(articleData.content || '');
      if (articleData.featured_image) {
        setFeaturedImage(articleData.featured_image);
        setImagePreview(articleData.featured_image);
      }
    }
  }, [articleData, editor, setValue]);

  const handleImageUpload = useCallback(async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await adminService.uploadImage(formData);
      setFeaturedImage(res.data.path);
      setImagePreview(res.data.url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const onSubmit = async (data: FormData) => {
    const content = editor?.getHTML() || '';
    if (!content || content === '<p></p>') {
      toast.error('Article content cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...data,
        category_id: Number(data.category_id),
        content,
        featured_image: featuredImage,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        is_breaking: data.is_breaking || false,
        is_trending: data.is_trending || false,
        is_featured: data.is_featured || false,
      };

      if (isEdit) {
        await adminService.updateArticle(Number(id), payload);
        toast.success('Article updated!');
      } else {
        await adminService.createArticle(payload);
        toast.success('Article created!');
        navigate('/admin/articles');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat()[0]
        : error.response?.data?.message || 'Failed to save article.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const ToolbarButton = ({ onClick, active, title, children }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${active ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
    >
      {children}
    </button>
  );

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Article' : 'New Article'} — Admin</title></Helmet>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/admin/articles')} className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-serif text-headline-lg">{isEdit ? 'Edit Article' : 'New Article'}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isEdit && articleData?.slug && (
              <a href={`/article/${articleData.slug}`} target="_blank" rel="noopener" className="btn-ghost flex items-center gap-2 text-sm py-2 px-4">
                <Eye size={15} /> Preview
              </a>
            )}
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
              <Save size={15} /> {saving ? 'Saving...' : 'Save Article'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="island-card p-5 space-y-4">
              <div>
                <input
                  {...register('title')}
                  placeholder="Article Title"
                  className="w-full font-serif text-2xl bg-transparent border-b border-outline-variant/40 pb-2 outline-none focus:border-outline placeholder:text-on-surface-variant/40 text-on-surface"
                />
                {errors.title && <p className="font-sans text-xs text-secondary mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <input
                  {...register('subtitle')}
                  placeholder="Subtitle (optional)"
                  className="w-full font-sans text-base bg-transparent border-b border-outline-variant/30 pb-2 outline-none focus:border-outline placeholder:text-on-surface-variant/40 text-on-surface-variant"
                />
              </div>
            </div>

            {/* Tiptap Editor */}
            <div className="island-card overflow-hidden">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-3 border-b border-outline-variant/30 bg-surface-container-low">
                <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold">
                  <Bold size={15} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic">
                  <Italic size={15} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline">
                  <UnderlineIcon size={15} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Strikethrough">
                  <Strikethrough size={15} />
                </ToolbarButton>
                <div className="w-px h-5 bg-outline-variant/40 mx-1" />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Heading 2">
                  <Heading2 size={15} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} title="Heading 3">
                  <Heading3 size={15} />
                </ToolbarButton>
                <div className="w-px h-5 bg-outline-variant/40 mx-1" />
                <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet List">
                  <List size={15} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Ordered List">
                  <ListOrdered size={15} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">
                  <Quote size={15} />
                </ToolbarButton>
                <div className="w-px h-5 bg-outline-variant/40 mx-1" />
                <ToolbarButton
                  onClick={() => {
                    const url = window.prompt('Enter URL:');
                    if (url) editor?.chain().focus().setLink({ href: url }).run();
                  }}
                  active={editor?.isActive('link')}
                  title="Add Link"
                >
                  <Link2 size={15} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    const url = window.prompt('Enter image URL:');
                    if (url) editor?.chain().focus().setImage({ src: url }).run();
                  }}
                  title="Insert Image"
                >
                  <ImageIcon size={15} />
                </ToolbarButton>
              </div>

              {/* Content */}
              <EditorContent
                editor={editor}
                className="min-h-[400px] font-sans text-base text-on-surface"
              />
            </div>

            {/* Excerpt */}
            <div className="island-card p-5">
              <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">
                Excerpt (optional)
              </label>
              <textarea
                {...register('excerpt')}
                rows={3}
                placeholder="Brief summary shown on article cards..."
                className="w-full bg-transparent border border-outline-variant/40 rounded-lg px-4 py-3 font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-outline resize-none"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Publish settings */}
            <div className="island-card p-5">
              <h3 className="font-sans text-sm font-semibold text-on-surface mb-4 uppercase tracking-wider">Publish</h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-1.5">Status</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="w-full px-3 py-2.5 border border-outline-variant/40 rounded-lg bg-surface font-sans text-sm text-on-surface outline-none">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    )}
                  />
                </div>

                {/* Toggles */}
                {[
                  { name: 'is_breaking' as const, label: 'Breaking News', desc: 'Show in ticker & badge' },
                  { name: 'is_trending' as const, label: 'Trending', desc: 'Feature in trending sidebar' },
                  { name: 'is_featured' as const, label: 'Featured', desc: 'Show in hero section' },
                ].map(toggle => (
                  <Controller
                    key={toggle.name}
                    name={toggle.name}
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-surface-container-low">
                        <div>
                          <p className="font-sans text-sm font-medium text-on-surface">{toggle.label}</p>
                          <p className="font-sans text-xs text-on-surface-variant">{toggle.desc}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={field.value}
                          onClick={() => field.onChange(!field.value)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${field.value ? 'bg-secondary' : 'bg-outline-variant'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${field.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </label>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="island-card p-5">
              <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Category *</label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full px-3 py-2.5 border border-outline-variant/40 rounded-lg bg-surface font-sans text-sm text-on-surface outline-none">
                    <option value="">Select category</option>
                    {categories?.map((cat: Category) => (
                      <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                    ))}
                  </select>
                )}
              />
              {errors.category_id && <p className="font-sans text-xs text-secondary mt-1">{errors.category_id.message}</p>}
            </div>

            {/* Featured image */}
            <div className="island-card p-5">
              <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-3">Featured Image</label>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden aspect-[16/9] mb-3">
                  <img src={imagePreview} alt="Featured" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setFeaturedImage(''); setImagePreview(''); }}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label
                  className="flex flex-col items-center justify-center w-full aspect-[16/9] border-2 border-dashed border-outline-variant/40 rounded-lg cursor-pointer hover:border-outline transition-colors"
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <Upload size={24} className="text-on-surface-variant mb-2" />
                  <p className="font-sans text-sm text-on-surface-variant text-center">
                    {uploading ? 'Uploading...' : 'Drop image here or click to upload'}
                  </p>
                  <p className="font-sans text-xs text-on-surface-variant/60 mt-1">JPG, PNG, WebP up to 5MB</p>
                </label>
              )}
            </div>

            {/* Tags */}
            <div className="island-card p-5">
              <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Tags</label>
              <input
                {...register('tags')}
                placeholder="egypt, politics, economy"
                className="w-full px-3 py-2.5 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-outline"
              />
              <p className="font-sans text-xs text-on-surface-variant mt-1">Comma-separated values</p>
            </div>

            {/* SEO */}
            <div className="island-card p-5">
              <h3 className="font-sans text-sm font-semibold text-on-surface mb-4 uppercase tracking-wider">SEO</h3>
              <div className="space-y-3">
                <div>
                  <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-1.5">Meta Title</label>
                  <input
                    {...register('meta_title')}
                    placeholder="SEO title (optional)"
                    className="w-full px-3 py-2.5 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline"
                  />
                </div>
                <div>
                  <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-1.5">Meta Description</label>
                  <textarea
                    {...register('meta_description')}
                    rows={2}
                    placeholder="SEO description (optional)"
                    className="w-full px-3 py-2.5 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
