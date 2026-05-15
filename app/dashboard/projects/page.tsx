'use client';

import { useState, useEffect } from 'react';
import { useBusiness } from '@/app/context/BusinessContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface Project {
  id?: string;
  name: string;
  type: 'new' | 'existing';
  location: string;
  budget: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  description: string;
}

export default function ProjectsPage() {
  const { selectedBusiness } = useBusiness();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'new' as 'new' | 'existing',
    location: '',
    budget: '',
    status: 'planning' as 'planning' | 'active' | 'completed' | 'cancelled',
    start_date: '',
    end_date: '',
    description: '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedBusiness) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'projects'), where('business_id', '==', selectedBusiness.id));
        const snapshot = await getDocs(q);
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [selectedBusiness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || !formData.name) return;

    try {
      const projectData = {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        business_id: selectedBusiness.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editingProject?.id) {
        await updateDoc(doc(db, 'projects', editingProject.id), {
          ...projectData,
          updated_at: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, 'projects'), projectData);
      }

      setFormData({
        name: '',
        type: 'new',
        location: '',
        budget: '',
        status: 'planning',
        start_date: '',
        end_date: '',
        description: '',
      });
      setShowForm(false);
      setEditingProject(null);

      const q = query(collection(db, 'projects'), where('business_id', '==', selectedBusiness.id));
      const snapshot = await getDocs(q);
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Gagal menyimpan proyek');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      type: project.type,
      location: project.location,
      budget: project.budget.toString(),
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date,
      description: project.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus proyek ini?')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Gagal menghapus proyek');
    }
  };

  const handleView = (projectId: string) => {
    router.push(`/dashboard/projections/${projectId}`);
  };

  if (!selectedBusiness) return <div className="p-8 text-gray-500">Pilih bisnis terlebih dahulu.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Proyek</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola proyek bisnis Anda</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingProject(null);
            setFormData({
              name: '',
              type: 'new',
              location: '',
              budget: '',
              status: 'planning',
              start_date: '',
              end_date: '',
              description: '',
            });
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Tutup Form' : 'Tambah Proyek'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {editingProject ? 'Edit Proyek' : 'Tambah Proyek Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Proyek *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipe Proyek *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="new">Proyek Baru</option>
                  <option value="existing">Proyek Existing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Anggaran (Rp)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tanggal Selesai</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="planning">Perencanaan</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProject(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                {editingProject ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Memuat data proyek...</p>
      ) : projects.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500">
          Belum ada proyek bisnis tercatat.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div key={p.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{p.name || 'Tanpa Nama'}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  p.status === 'active' ? 'bg-green-100 text-green-700' :
                  p.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  p.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {p.status === 'planning' ? 'Perencanaan' :
                   p.status === 'active' ? 'Aktif' :
                   p.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">Tipe: {p.type === 'new' ? 'Proyek Baru' : 'Proyek Existing'}</p>
              <p className="text-sm text-gray-500 mb-2">Lokasi: {p.location || '-'}</p>
              <p className="text-sm text-gray-500 mb-2">Anggaran: Rp {p.budget?.toLocaleString('id-ID') || '0'}</p>
              {p.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{p.description}</p>}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleView(p.id!)}
                  className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Lihat Proyeksi
                </button>
                <button
                  onClick={() => handleEdit(p)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id!)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
