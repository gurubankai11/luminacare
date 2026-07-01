import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Define styles
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { borderBottom: '2 solid #0ea5e9', paddingBottom: 10, marginBottom: 20 },
  clinicName: { fontSize: 24, fontWeight: 'bold', color: '#0ea5e9' },
  clinicSub: { fontSize: 10, color: '#64748b', marginTop: 4 },
  docInfo: { marginTop: 10, fontSize: 12 },
  docName: { fontWeight: 'bold', color: '#0f172a' },
  docSpec: { color: '#64748b' },
  patientSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, backgroundColor: '#f8fafc', padding: 10, borderRadius: 5 },
  patientInfo: { fontSize: 11, color: '#334155' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 10, marginTop: 15, borderBottom: '1 solid #e2e8f0', paddingBottom: 5 },
  medRow: { flexDirection: 'row', borderBottom: '1 solid #f1f5f9', paddingVertical: 8 },
  medName: { width: '40%', fontSize: 12, fontWeight: 'bold' },
  medDosage: { width: '20%', fontSize: 11, color: '#475569' },
  medTiming: { width: '20%', fontSize: 11, color: '#475569' },
  medDuration: { width: '20%', fontSize: 11, color: '#475569' },
  notes: { fontSize: 11, color: '#475569', marginTop: 5, lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 10, borderTop: '1 solid #e2e8f0', paddingTop: 10 }
})

interface PrescriptionPDFProps {
  doctorName: string
  doctorSpecialty: string
  patientName: string
  date: string
  diagnosis: string
  medicines: any[]
  instructions: string
}

export const PrescriptionPDF = ({ doctorName, doctorSpecialty, patientName, date, diagnosis, medicines, instructions }: PrescriptionPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.clinicName}>LuminaCare Hospital</Text>
        <Text style={styles.clinicSub}>42, Bandra West, Mumbai, Maharashtra 400050</Text>
        <View style={styles.docInfo}>
          <Text style={styles.docName}>{doctorName}</Text>
          <Text style={styles.docSpec}>{doctorSpecialty}</Text>
        </View>
      </View>

      <View style={styles.patientSection}>
        <View>
          <Text style={styles.patientInfo}>Patient Name: {patientName}</Text>
          {diagnosis && <Text style={styles.patientInfo}>Diagnosis: {diagnosis}</Text>}
        </View>
        <View>
          <Text style={styles.patientInfo}>Date: {date}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Rx - Medicines</Text>
      <View style={{ marginBottom: 20 }}>
        <View style={[styles.medRow, { backgroundColor: '#f1f5f9' }]}>
          <Text style={[styles.medName, { paddingLeft: 5 }]}>Medicine</Text>
          <Text style={styles.medDosage}>Dosage</Text>
          <Text style={styles.medTiming}>Timing</Text>
          <Text style={styles.medDuration}>Duration</Text>
        </View>
        {medicines.map((med, i) => {
          const timing = [
            med.morning ? 'Morning' : null,
            med.afternoon ? 'Afternoon' : null,
            med.night ? 'Night' : null
          ].filter(Boolean).join(', ')
          
          return (
            <View key={i} style={styles.medRow}>
              <Text style={[styles.medName, { paddingLeft: 5 }]}>{med.name}</Text>
              <Text style={styles.medDosage}>{med.dosage}</Text>
              <Text style={styles.medTiming}>{timing || '-'}</Text>
              <Text style={styles.medDuration}>{med.duration || '-'}</Text>
            </View>
          )
        })}
      </View>

      {instructions && (
        <View>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <Text style={styles.notes}>{instructions}</Text>
        </View>
      )}

      <Text style={styles.footer}>
        This is a digitally generated prescription and does not require a physical signature.
      </Text>
    </Page>
  </Document>
)
