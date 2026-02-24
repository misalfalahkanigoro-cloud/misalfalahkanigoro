import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { PPDBRegistration } from '@/lib/types';

const styles = StyleSheet.create({
    page: {
        padding: 32,
        fontSize: 11,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 11,
        color: '#555',
        marginTop: 4,
    },
    section: {
        marginTop: 16,
        padding: 12,
        border: '1 solid #E5E7EB',
        borderRadius: 6,
    },
    label: {
        width: '35%',
        color: '#6B7280',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    value: {
        width: '65%',
        fontWeight: 'bold',
    },
    footnote: {
        marginTop: 20,
        fontSize: 9,
        color: '#6B7280',
    },
});

type Props = {
    data: PPDBRegistration;
};

const PPDBPdfDocument: React.FC<Props> = ({ data }) => {
    const fileLabels: Record<string, string> = {
        kk: 'Foto Kartu Keluarga (KK)',
        akta_kelahiran: 'Akta Kelahiran',
        ktp_wali: 'KTP Orang Tua/Wali',
        pas_foto: 'Pas Foto Siswa',
        nisn: 'Kartu/Print NISN',
        ijazah_rapor: 'Ijazah/Rapor Terakhir',
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Formulir PPDB - MIS Al Falah Kanigoro</Text>
                    <Text style={styles.subtitle}>
                        Bukti pendaftaran dan data calon peserta didik.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Data Calon Siswa</Text>
                    <View style={styles.row}><Text style={styles.label}>Nomor Pendaftaran (NISN)</Text><Text style={styles.value}>{data.nisn || '-'}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Nama Lengkap</Text><Text style={styles.value}>{data.namaLengkap}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>NIK</Text><Text style={styles.value}>{data.nik}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>NISN</Text><Text style={styles.value}>{data.nisn || '-'}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Tempat, Tanggal Lahir</Text><Text style={styles.value}>{data.tempatLahir}, {data.tanggalLahir}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Jenis Kelamin</Text><Text style={styles.value}>{data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Alamat</Text><Text style={styles.value}>{data.alamat}</Text></View>
                </View>

                <View style={styles.section}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Data Orang Tua / Wali</Text>
                    <View style={styles.row}><Text style={styles.label}>Nama Ayah</Text><Text style={styles.value}>{data.namaAyah}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Pekerjaan Ayah</Text><Text style={styles.value}>{data.pekerjaanAyah || '-'}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Nama Ibu</Text><Text style={styles.value}>{data.namaIbu}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Pekerjaan Ibu</Text><Text style={styles.value}>{data.pekerjaanIbu || '-'}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>No. WhatsApp</Text><Text style={styles.value}>{data.noHp}</Text></View>
                </View>

                <View style={styles.section}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Berkas Terunggah</Text>
                    {(data.files || []).map((file) => (
                        <View style={styles.row} key={file.id}>
                            <Text style={styles.label}>{fileLabels[file.fileType] || file.fileType}</Text>
                            <Text style={styles.value}>{file.fileUrl}</Text>
                        </View>
                    ))}
                    {(data.files || []).length === 0 && (
                        <Text>Belum ada berkas terunggah.</Text>
                    )}
                </View>

                <Text style={styles.footnote}>
                    Dokumen ini dihasilkan otomatis oleh sistem PPDB MIS Al Falah Kanigoro.
                </Text>
            </Page>
        </Document>
    );
};

export default PPDBPdfDocument;
