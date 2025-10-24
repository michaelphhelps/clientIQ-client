# CRM System Style Guide

This style guide defines the consistent design system for your CRM application based on your wireframe.

## Color Palette

```css
--primary-blue: #5865F2      /* Main brand color for headers and primary actions */
--secondary-blue: #4752C4    /* Darker blue for hover states */
--light-blue: #E8EAFF        /* Light blue for backgrounds and active states */
--success-green: #00C851     /* Success states and positive values */
--warning-yellow: #FFB900    /* Warning states and in-progress items */
--danger-red: #FF4444        /* Error states and negative actions */
--text-primary: #2C3E50      /* Main text color */
--text-secondary: #7F8C8D    /* Secondary text and descriptions */
--text-muted: #95A5A6        /* Muted text for less important content */
--border-color: #E0E6ED      /* Borders and dividers */
--background-light: #F8F9FA  /* Page background */
--background-white: #FFFFFF  /* Card and container backgrounds */
```

## Layout Structure

### Main Layout

- Header with CRM System title and user info
- Sidebar navigation (250px wide)
- Main content area with 2rem padding
- Responsive design that stacks on mobile

### Navigation

- Active nav items have blue background and left border
- Icons use emoji for simplicity (can be replaced with icon library)
- Hover effects for better UX

## Components

### StatCard

Use for displaying key metrics and numbers:

```jsx
<StatCard
  label="Total Clients"
  value="24"
/>
<StatCard
  label="Revenue This Month"
  value="$45,200"
  type="currency"
/>
```

### DataTable

For displaying tabular data with consistent styling:

```jsx
<DataTable
  title="Orders by Status"
  columns={columns}
  data={orders}
  onRowClick={handleRowClick}
/>
```

### StatusBadge

For status indicators with predefined colors:

```jsx
<StatusBadge type="status-in-progress">In Progress</StatusBadge>
<StatusBadge type="payment-paid">Paid</StatusBadge>
```

### Alert

For informational messages and notifications:

```jsx
<Alert
  type="info"
  title="Navigation:"
  message="Client Manager can navigate to their clients or orders using the sidebar"
/>
```

## Status Types

### Order Status

- `status-new` - Light blue background
- `status-in-progress` - Yellow background
- `status-ready` - Green background

### Payment Status

- `payment-unpaid` - Red background
- `payment-partial` - Yellow background
- `payment-paid` - Green background

## Typography

- Page titles: 2rem, font-weight 600
- Section titles: 1.25rem, font-weight 600
- Body text: 1rem, line-height 1.6
- Table headers: 0.875rem, font-weight 600

## Spacing

- Page padding: 2rem
- Card padding: 1.5rem
- Grid gap: 1.5rem
- Border radius: 8px
- Box shadows: Light and medium variants

## Usage Examples

### Creating a New Page

```jsx
import React from "react";
import { Layout, PageHeader, DataTable } from "../components";

const MyNewPage = () => {
  return (
    <Layout currentPage="my-page">
      <PageHeader title="My Page Title" subtitle="Page description" />

      {/* Your page content */}
    </Layout>
  );
};
```

### Maintaining Consistency

- Always use the Layout component for pages
- Use PageHeader for consistent page titles
- Use predefined status badge types
- Follow the established color palette
- Use the stats grid for dashboard metrics

This design system ensures all pages in your CRM will have consistent styling that matches your wireframe.
