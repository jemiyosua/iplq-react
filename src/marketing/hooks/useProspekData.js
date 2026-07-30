import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mkt_prospek_data';

// Data dummy awal
const initialData = [
  { namaCluster: 'Griya Asri', alamat: 'Jl. Mawar No.1, Bekasi', pic: 'Pak Budi', noTelepon: '08123456789', jumlahRumah: '150', tanggalKunjungan: '2025-01-15', keterangan: 'Tertarik paket premium', status: 'Follow Up' },
  { namaCluster: 'Taman Sentosa', alamat: 'Jl. Kenanga No.5, Tangerang', pic: 'Ibu Sari', noTelepon: '08567890123', jumlahRumah: '200', tanggalKunjungan: '2025-01-20', keterangan: 'Butuh proposal harga', status: 'Proposal Penawaran' },
  { namaCluster: 'Green Valley', alamat: 'Jl. Dahlia No.10, Bogor', pic: 'Pak Andi', noTelepon: '08198765432', jumlahRumah: '80', tanggalKunjungan: '2025-02-01', keterangan: 'Belum ada keputusan', status: 'Pending' },
  { namaCluster: 'Citra Indah', alamat: 'Jl. Anggrek No.3, Depok', pic: 'Ibu Rina', noTelepon: '08112233445', jumlahRumah: '300', tanggalKunjungan: '2025-02-10', keterangan: 'Sedang negosiasi harga', status: 'Negosiasi' },
  { namaCluster: 'Permata Hijau', alamat: 'Jl. Melati No.8, Jakarta', pic: 'Pak Doni', noTelepon: '08556677889', jumlahRumah: '50', tanggalKunjungan: '2025-02-15', keterangan: 'Tidak jadi', status: 'Close/Batal' },
  { namaCluster: 'Royal Residence', alamat: 'Jl. Flamboyan No.2, Cikarang', pic: 'Pak Hendra', noTelepon: '08211223344', jumlahRumah: '120', tanggalKunjungan: '2025-03-01', keterangan: 'Baru pertama kali kontak', status: 'Baru' },
  { namaCluster: 'Bukit Harmoni', alamat: 'Jl. Sakura No.7, Cibubur', pic: 'Ibu Dewi', noTelepon: '08399887766', jumlahRumah: '90', tanggalKunjungan: '2025-03-05', keterangan: 'Kunjungan awal', status: 'Tahap Awal' },
];

export const useProspekData = () => {
  const [prospekList, setProspekList] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prospekList));
  }, [prospekList]);

  const summary = {
    total: prospekList.length,
    baru: prospekList.filter((p) => p.status === 'Baru').length,
    tahapAwal: prospekList.filter((p) => p.status === 'Tahap Awal').length,
    followUp: prospekList.filter((p) => p.status === 'Follow Up').length,
    negosiasi: prospekList.filter((p) => p.status === 'Negosiasi').length,
    proposal: prospekList.filter((p) => p.status === 'Proposal Penawaran').length,
    pending: prospekList.filter((p) => p.status === 'Pending').length,
    close: prospekList.filter((p) => p.status === 'Close/Batal').length,
  };

  return { prospekList, setProspekList, summary };
};
