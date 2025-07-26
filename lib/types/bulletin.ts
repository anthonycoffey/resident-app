export interface Bulletin {
  id: string;
  title: string;
  body: string;
  createdAt: any; // Firestore timestamp
  type: 'bulletin';
  level: 'info' | 'warning' | 'alert';
  propertyId: string;
  organizationId: string;
}
