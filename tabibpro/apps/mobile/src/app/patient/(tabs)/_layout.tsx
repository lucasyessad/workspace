// ============================================================
// TabibPro Mobile — Layout Tabs Patient
// ============================================================

import { Tabs } from 'expo-router';
import { Home, Calendar, FolderOpen, MessageCircle } from 'lucide-react-native';
import { COLORS } from '@/lib/theme';

export default function PatientTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary[600],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[100],
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="accueil"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="rdv"
        options={{
          title: 'Mes RDV',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="dossier"
        options={{
          title: 'Mon dossier',
          tabBarIcon: ({ color, size }) => <FolderOpen color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="messagerie"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size - 2} />,
          tabBarBadge: 2,
        }}
      />
    </Tabs>
  );
}
