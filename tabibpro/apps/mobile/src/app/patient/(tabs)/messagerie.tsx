// ============================================================
// TabibPro Mobile — Messagerie Patient
// Messages sécurisés avec le médecin
// ============================================================

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/lib/theme';

type Conversation = {
  id: string;
  medecin: string;
  specialite: string;
  dernierMessage: string;
  heure: string;
  nonLus: number;
};

type Message = {
  id: string;
  role: 'patient' | 'medecin';
  contenu: string;
  heure: string;
};

const CONVERSATIONS: Conversation[] = [
  { id: '1', medecin: 'Dr. Hamid Belkacem', specialite: 'Médecin généraliste', dernierMessage: 'Votre glycémie est revenue à la normale. Continuez le traitement.', heure: '09:15', nonLus: 1 },
  { id: '2', medecin: 'Dr. Nadia Ferhat', specialite: 'Cardiologue', dernierMessage: 'RDV confirmé pour le 15 mars.', heure: 'Hier', nonLus: 1 },
];

const MESSAGES_DEMO: Message[] = [
  { id: '1', role: 'medecin', contenu: 'Bonjour Mme Benali, j\'ai reçu vos résultats d\'analyses.', heure: '08:50' },
  { id: '2', role: 'medecin', contenu: 'Votre glycémie est revenue à la normale. Continuez le traitement en cours.', heure: '08:51' },
  { id: '3', role: 'patient', contenu: 'Merci Docteur, est-ce que je dois revenir vous voir bientôt ?', heure: '09:10' },
  { id: '4', role: 'medecin', contenu: 'Oui, nous ferons un bilan dans 3 mois. Je vous envoie une ordonnance de renouvellement.', heure: '09:15' },
];

export default function PatientMessagerieScreen() {
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(MESSAGES_DEMO);
  const [input, setInput] = useState('');

  const envoyerMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: 'patient',
      contenu: input.trim(),
      heure: now,
    }]);
    setInput('');
  };

  if (selectedConv) {
    const conv = CONVERSATIONS.find((c) => c.id === selectedConv)!;

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Header conversation */}
        <View style={styles.convHeader}>
          <TouchableOpacity onPress={() => setSelectedConv(null)} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.convHeaderInfo}>
            <Text style={styles.convHeaderNom}>{conv.medecin}</Text>
            <Text style={styles.convHeaderSpe}>{conv.specialite}</Text>
          </View>
        </View>

        {/* Avertissement données médicales */}
        <View style={styles.alerteBanner}>
          <Text style={styles.alerteBannerText}>🔒 Messagerie sécurisée — Ne pas envoyer de documents administratifs par ce canal</Text>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.role === 'patient' ? styles.bubblePatient : styles.bubbleMedecin,
            ]}>
              <Text style={[
                styles.bubbleText,
                item.role === 'patient' ? styles.bubbleTextPatient : styles.bubbleTextMedecin,
              ]}>
                {item.contenu}
              </Text>
              <Text style={styles.bubbleTime}>{item.heure}</Text>
            </View>
          )}
        />

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.messageInput}
            placeholder="Votre message au médecin..."
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={envoyerMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendBtnText}>›</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>Messages</Text>
      </View>

      {CONVERSATIONS.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>Aucun message</Text>
        </View>
      ) : (
        <FlatList
          data={CONVERSATIONS}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.convList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convCard}
              onPress={() => setSelectedConv(item.id)}
              activeOpacity={0.85}
            >
              <View style={styles.convAvatar}>
                <Text style={styles.convAvatarText}>
                  {item.medecin.split(' ').slice(-1)[0].charAt(0)}
                </Text>
              </View>
              <View style={styles.convInfo}>
                <View style={styles.convInfoRow}>
                  <Text style={styles.convMedecin}>{item.medecin}</Text>
                  <Text style={styles.convHeure}>{item.heure}</Text>
                </View>
                <Text style={styles.convSpe}>{item.specialite}</Text>
                <Text style={styles.convDernier} numberOfLines={1}>{item.dernierMessage}</Text>
              </View>
              {item.nonLus > 0 && (
                <View style={styles.nonLuBadge}>
                  <Text style={styles.nonLuText}>{item.nonLus}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  listHeader: {
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxxl, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100],
  },
  listHeaderTitle: { ...TYPOGRAPHY.h2, color: COLORS.gray[900] },
  convList: { padding: SPACING.lg },
  convCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOWS.sm,
  },
  convAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary[100],
    alignItems: 'center', justifyContent: 'center',
  },
  convAvatarText: { fontSize: 18, fontWeight: '800', color: COLORS.primary[700] },
  convInfo: { flex: 1 },
  convInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convMedecin: { fontSize: 14, fontWeight: '700', color: COLORS.gray[900] },
  convHeure: { fontSize: 11, color: COLORS.gray[400] },
  convSpe: { fontSize: 11, color: COLORS.gray[500], marginTop: 1 },
  convDernier: { fontSize: 12, color: COLORS.gray[500], marginTop: 4 },
  nonLuBadge: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary[600],
    alignItems: 'center', justifyContent: 'center',
  },
  nonLuText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  separator: { height: SPACING.sm },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: 16, color: COLORS.gray[500] },
  // Conversation ouverte
  convHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxxl, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100],
  },
  backBtn: { padding: SPACING.sm },
  backText: { fontSize: 28, color: COLORS.primary[600] },
  convHeaderInfo: {},
  convHeaderNom: { fontSize: 15, fontWeight: '700', color: COLORS.gray[900] },
  convHeaderSpe: { fontSize: 12, color: COLORS.gray[500] },
  alerteBanner: {
    backgroundColor: '#eff6ff', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: '#bfdbfe',
  },
  alerteBannerText: { fontSize: 11, color: '#1e40af', textAlign: 'center' },
  messagesList: { padding: SPACING.lg, gap: SPACING.sm },
  messageBubble: { maxWidth: '80%', borderRadius: RADIUS.xl, padding: SPACING.md },
  bubblePatient: { alignSelf: 'flex-end', backgroundColor: COLORS.primary[600], borderBottomRightRadius: 4 },
  bubbleMedecin: { alignSelf: 'flex-start', backgroundColor: COLORS.white, ...SHADOWS.sm, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextPatient: { color: COLORS.white },
  bubbleTextMedecin: { color: COLORS.gray[800] },
  bubbleTime: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 4, alignSelf: 'flex-end' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray[100],
  },
  messageInput: {
    flex: 1, backgroundColor: COLORS.gray[50], borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary[600], alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: COLORS.white, fontSize: 22, fontWeight: '300', marginLeft: 2 },
});
