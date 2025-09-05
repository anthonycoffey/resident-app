import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import Card from '@/components/ui/Card';
import JourneySelection from './components/JourneySelection';
import ServiceRequestForm from './components/ServiceRequestForm';

type Journey = 'on-premise' | 'off-premise' | null;

const ServiceRequestScreen = () => {
  const [journey, setJourney] = useState<Journey>(null);

  return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        <Card>
          {journey ? (
            <ServiceRequestForm
              journey={journey}
              onBack={() => setJourney(null)}
            />
          ) : (
            <JourneySelection onSelectJourney={setJourney} />
          )}
        </Card>
      </ScrollView>
  );
};

export default ServiceRequestScreen;
