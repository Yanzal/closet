import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { useState } from 'react';

import { AddSheet } from '@/components/add-sheet';
import { TabBar, TabItem } from '@/components/tab-bar';
import { Ionicons, MaterialCommunityIcons } from '@/components/ui/icon';
import { palette } from '@/constants/theme';

const ACTIVE = palette.ink;
const INACTIVE = palette.gray;

export default function TabsLayout() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <Tabs>
        <TabSlot />
        <TabList asChild>
          <TabBar onAdd={() => setAddOpen(true)}>
            <TabTrigger name="home" href="/" asChild>
              <TabItem
                label="Home"
                icon={(a) => (
                  <Ionicons name={a ? 'home' : 'home-outline'} size={24} color={a ? ACTIVE : INACTIVE} />
                )}
              />
            </TabTrigger>
            <TabTrigger name="closet" href="/closet" asChild>
              <TabItem
                label="Closet"
                icon={(a) => (
                  <MaterialCommunityIcons
                    name={a ? 'wardrobe' : 'wardrobe-outline'}
                    size={24}
                    color={a ? ACTIVE : INACTIVE}
                  />
                )}
              />
            </TabTrigger>
            <TabTrigger name="outfit" href="/outfit" asChild>
              <TabItem
                label="Outfit"
                icon={(a) => (
                  <MaterialCommunityIcons
                    name={a ? 'tshirt-crew' : 'tshirt-crew-outline'}
                    size={24}
                    color={a ? ACTIVE : INACTIVE}
                  />
                )}
              />
            </TabTrigger>
            <TabTrigger name="explore" href="/explore" asChild>
              <TabItem
                label="Explore"
                icon={(a) => (
                  <Ionicons
                    name={a ? 'compass' : 'compass-outline'}
                    size={24}
                    color={a ? ACTIVE : INACTIVE}
                  />
                )}
              />
            </TabTrigger>
          </TabBar>
        </TabList>
      </Tabs>
      <AddSheet visible={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
