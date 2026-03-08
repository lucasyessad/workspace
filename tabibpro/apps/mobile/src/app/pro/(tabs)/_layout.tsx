// ============================================================
// TabibPro Mobile — Layout Tabs Professionnel
// ============================================================

import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, CalendarDays, Stethoscope } from 'lucide-react-native';
import { COLORS } from '@/lib/theme';

export default function ProTabsLayout() {
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
        name="dashboard"
        options={{
          title: 'Tableau de bord',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="consultation"
        options={{
          title: 'Consultation',
          tabBarIcon: ({ color, size }) => <Stethoscope color={color} size={size - 2} />,
        }}
      />
    </Tabs>
  );
}
