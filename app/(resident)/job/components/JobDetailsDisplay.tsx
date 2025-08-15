import React from 'react';
import { View, StyleSheet, Linking, Image } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';
import type { Job } from '@/lib/services/phoenixService';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';

interface JobDetailsDisplayProps {
  job: Job;
}

const formatDateTime = (isoString: string | null | undefined) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    console.error('Invalid Date', e);
    return 'Invalid Date';
  }
};

const DetailRow = ({ label, value }: { label: string; value: string }) => {
  const tintColor = useThemeColor({}, 'tint');
  const textMutedColor = useThemeColor({}, 'textMuted');
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: textMutedColor }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: tintColor }]}>{value}</Text>
    </View>
  );
};

const JobDetailsDisplay: React.FC<JobDetailsDisplayProps> = ({ job }) => {
  const tintColor = useThemeColor({}, 'tint');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const white = useThemeColor({}, 'white');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');

  const {
    Customer: customer,
    Car: car,
    arrivalTime,
    Address: serviceAddress,
    JobLineItems: services,
    Invoices: invoices,
  } = job;

  const vehicleDisplay = car ? `${car.year} ${car.make} ${car.model}` : 'N/A';
  const relevantInvoice =
    invoices?.find((inv) => inv.status === 'pending') || invoices?.[0];

  return (
    <View>
      <DetailRow label='Customer Name' value={customer.fullName} />
      <DetailRow label='Vehicle' value={vehicleDisplay} />
      <DetailRow label='Arrival Time' value={formatDateTime(arrivalTime)} />
      <DetailRow
        label='Service Location'
        value={serviceAddress.short || serviceAddress.fullAddress}
      />

      <Divider style={{ marginVertical: 15 }} />

      <Text style={[styles.title, { color: tintColor }]}>Services</Text>
      <View style={[styles.table, { borderColor: textMutedColor }]}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { color: tintColor }]}>
            Service
          </Text>
          <Text
            style={[
              styles.tableHeaderText,
              { color: tintColor, textAlign: 'right' },
            ]}
          >
            Price
          </Text>
        </View>
        {services.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={{ color: textMutedColor }}>
              {item.Service?.name || 'N/A'}
            </Text>
            <Text style={{ color: textMutedColor, textAlign: 'right' }}>
              ${(item.price / 100).toFixed(2)}
            </Text>
          </View>
        ))}
        {relevantInvoice && (
          <View style={[styles.tableRow, styles.tableFooter]}>
            <Text style={[styles.tableFooterText, { color: tintColor }]}>
              Total
            </Text>
            <Text
              style={[
                styles.tableFooterText,
                { color: tintColor, textAlign: 'right' },
              ]}
            >
              ${(relevantInvoice.total / 100).toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {relevantInvoice && (
        <Button
          title='Pay Now'
          variant='filled'
          onPress={() =>
            Linking.openURL(
              `${process.env.EXPO_PUBLIC_PHOENIX_API_URL}/invoices/${relevantInvoice.linkCode}`
            )
          }
          style={{ marginTop: 20 }}
          textStyle={{ color: white }}
        />
      )}

      <View style={styles.badgesContainer}>
        <Image
          source={require('@/assets/images/review1.png')}
          style={styles.badgeImage}
        />
        <Image
          source={require('@/assets/images/review2.png')}
          style={styles.badgeImage}
        />
        <Image
          source={require('@/assets/images/review3.png')}
          style={styles.badgeImage}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerTitle, { color: tintColor }]}>
          We value your privacy and adhere to strict industry standards for
          payment processing!
        </Text>
        <Text style={[styles.footerText, { color: textMutedColor }]}>
          • 128-bit Secure Sockets Layer (SSL) technology for secure Internet
          Protocol (IP) transactions.
        </Text>
        <Text style={[styles.footerText, { color: textMutedColor }]}>
          • Industry leading encryption hardware and software methods and
          security protocols to protect customer information.
        </Text>
        <Text style={[styles.footerText, { color: textMutedColor }]}>
          • Compliance with the Payment Card Industry Data Security Standard
          (PCI DSS).
        </Text>
        <Text
          style={[styles.footerLink, { color: textMutedColor, marginTop: 10 }]}
        >
          For more details, please review our company's{' '}
          <Text
            style={{ color: primaryColor }}
            onPress={() =>
              Linking.openURL(
                'https://24hrcarunlocking.com/terms-and-conditions/'
              )
            }
          >
            Terms and Conditions
          </Text>
          {' and '}
          <Text
            style={{ color: primaryColor }}
            onPress={() =>
              Linking.openURL('https://24hrcarunlocking.com/privacy-policy/')
            }
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  table: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  tableFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 5,
    paddingTop: 5,
  },
  tableFooterText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  badgeImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  footerLink: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default JobDetailsDisplay;
