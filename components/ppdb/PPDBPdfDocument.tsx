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

const normalizePdfText = (value: unknown, fallback = '-'): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed ? trimmed : fallback;
    }
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value);
    }
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? fallback : value.toISOString().slice(0, 10);
    }
    if (Array.isArray(value)) {
        const joined = value.map((entry) => normalizePdfText(entry, '')).filter(Boolean).join(', ');
        return joined || fallback;
    }
    if (typeof value === 'object') {
        const candidate = value as { props?: { children?: unknown } };
        if (candidate?.props?.children !== undefined) {
            return normalizePdfText(candidate.props.children, fallback);
        }
        const isoDateCandidate = 'toISOString' in (value as object) ? (value as { toISOString?: () => string }) : null;
        if (isoDateCandidate?.toISOString) {
            try {
                return isoDateCandidate.toISOString().slice(0, 10);
            } catch {
                return fallback;
            }
        }
        try {
            return JSON.stringify(value);
        } catch {
            return fallback;
        }
    }
    return fallback;
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
                    <View style={styles.row}><Text style={styles.label}>Nomor Pendaftaran (NISN)</Text><Text style={styles.value}>{normalizePdfText(data.nisn)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Nama Lengkap</Text><Text style={styles.value}>{normalizePdfText(data.namaLengkap)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>NIK</Text><Text style={styles.value}>{normalizePdfText(data.nik)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>NISN</Text><Text style={styles.value}>{normalizePdfText(data.nisn)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Tempat, Tanggal Lahir</Text><Text style={styles.value}>{`${normalizePdfText(data.tempatLahir)}, ${normalizePdfText(data.tanggalLahir)}`}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Jenis Kelamin</Text><Text style={styles.value}>{normalizePdfText(data.jenisKelamin) === 'L' ? 'Laki-laki' : 'Perempuan'}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Alamat</Text><Text style={styles.value}>{normalizePdfText(data.alamat)}</Text></View>
                </View>

                <View style={styles.section}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Data Orang Tua / Wali</Text>
                    <View style={styles.row}><Text style={styles.label}>Nama Ayah</Text><Text style={styles.value}>{normalizePdfText(data.namaAyah)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Pekerjaan Ayah</Text><Text style={styles.value}>{normalizePdfText(data.pekerjaanAyah)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Nama Ibu</Text><Text style={styles.value}>{normalizePdfText(data.namaIbu)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Pekerjaan Ibu</Text><Text style={styles.value}>{normalizePdfText(data.pekerjaanIbu)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>No. WhatsApp</Text><Text style={styles.value}>{normalizePdfText(data.noHp)}</Text></View>
                </View>

                <View style={styles.section}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Berkas Terunggah</Text>
                    {(data.files || []).map((file) => (
                        <View style={styles.row} key={file.id}>
                            <Text style={styles.label}>{fileLabels[file.fileType] || normalizePdfText(file.fileType)}</Text>
                            <Text style={styles.value}>{normalizePdfText(file.fileUrl)}</Text>
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
