'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import {
  Button,
  Input,
  Select,
  Checkbox,
  RadioGroup,
  Badge,
  Skeleton,
  Drawer,
  Modal,
  ToastProvider,
  useToast,
  EmptyState,
  ErrorState,
} from '@/components/ui';
import { ShoppingBag, Heart } from 'lucide-react';

function PreviewContent() {
  const { showToast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [radioVal, setRadioVal] = useState('floral');
  const [checked, setChecked] = useState(true);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12 bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] pb-6">
        <span className="text-label text-[var(--color-text-muted)]">Design System Preview</span>
        <h1 className="text-h1 text-[var(--color-text)] mt-1">Component Gallery</h1>
        <p className="text-body text-[var(--color-text-muted)] mt-2">
          Internal development preview of all base UI components across interactive states.
        </p>
      </header>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-h2 text-[var(--color-text)]">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-[var(--color-surface)] rounded-[4px] border border-[var(--color-border)]">
          <Button variant="primary">Primary Default</Button>
          <Button variant="primary" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            With Icon
          </Button>
          <Button variant="primary" isLoading>
            Loading
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>

          <Button variant="secondary">Secondary Default</Button>
          <Button variant="secondary">
            Next
          </Button>
          <Button variant="secondary" disabled>
            Secondary Disabled
          </Button>

          <Button variant="text">Text Link Action</Button>
          <Button variant="text" disabled>
            Text Disabled
          </Button>

          <Button variant="icon" aria-label="Favorite">
            <Heart className="w-5 h-5 text-[var(--color-text)]" />
          </Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-h2 text-[var(--color-text)]">Form Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[var(--color-surface)] rounded-[4px] border border-[var(--color-border)]">
          <Input label="Default Text Field" placeholder="Enter recipient name" />
          <Input
            label="Field with Helper Text"
            placeholder="example@boutique.com"
            helperText="We will send order confirmation here"
          />
          <Input
            label="Field with Error State"
            defaultValue="invalid-pin"
            error="Please enter a valid 6-digit PIN code"
          />
          <Input label="Disabled Field" defaultValue="Pre-filled value" disabled />
        </div>
      </section>

      {/* Select & Checkbox & Radio */}
      <section className="space-y-4">
        <h2 className="text-h2 text-[var(--color-text)]">Select, Checkbox & Radio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[var(--color-surface)] rounded-[4px] border border-[var(--color-border)]">
          <Select
            label="Choose Size"
            options={[
              { value: 'reg', label: 'Regular (approx 9 cm)' },
              { value: 'lg', label: 'Large (approx 11 cm)' },
              { value: 'mini', label: 'Mini (approx 6 cm)', disabled: true },
            ]}
          />
          <Select
            label="Select with Error"
            options={[{ value: '', label: 'Select an option...' }]}
            error="Please choose an option to proceed"
          />
          <div className="space-y-3">
            <Checkbox
              label="Save this address for future purchases"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <Checkbox label="Disabled option" checked={false} disabled />
            <Checkbox label="Checkbox with error" error="You must accept this" />
          </div>
          <div>
            <RadioGroup
              name="fabric-preview"
              label="Select Fabric"
              value={radioVal}
              onChange={setRadioVal}
              options={[
                { value: 'floral', label: 'Floral Cotton', detail: 'Lightweight & soft' },
                { value: 'corduroy', label: 'Washed Corduroy', detail: 'Textured & durable' },
                { value: 'linen', label: 'Pure Linen', detail: 'Currently out of stock', disabled: true },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Badges & Skeletons */}
      <section className="space-y-4">
        <h2 className="text-h2 text-[var(--color-text)]">Badges & Skeletons</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-[var(--color-surface)] rounded-[4px] border border-[var(--color-border)]">
          <Badge variant="blush">New In</Badge>
          <Badge variant="sage">In Stock</Badge>
          <Badge variant="muted">Pre-order</Badge>

          <div className="flex gap-3 items-center ml-auto">
            <Skeleton width={120} height={36} />
            <Skeleton width={36} height={36} circle />
          </div>
        </div>
      </section>

      {/* Overlays (Drawer, Modal, Toast) */}
      <section className="space-y-4">
        <h2 className="text-h2 text-[var(--color-text)]">Overlays & Notifications</h2>
        <div className="flex flex-wrap gap-4 p-6 bg-[var(--color-surface)] rounded-[4px] border border-[var(--color-border)]">
          <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>
            Open Test Drawer
          </Button>
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            Open Test Modal
          </Button>
          <Button
            variant="secondary"
            onClick={() => showToast('Configuration saved successfully!', 'success')}
          >
            Trigger Success Toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => showToast('Could not reach quote service', 'error')}
          >
            Trigger Error Toast
          </Button>
        </div>

        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Sample Drawer"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsDrawerOpen(false)}>
                Close
              </Button>
            </div>
          }
        >
          <p className="text-body text-[var(--color-text)]">
            This drawer demonstrates focus trap, Escape key handling, and clean responsive layout.
          </p>
        </Drawer>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Sample Modal Dialog"
          footer={
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Got it
            </Button>
          }
        >
          <p className="text-body text-[var(--color-text)]">
            This modal demonstrates accessible dialog behavior with focus management.
          </p>
        </Modal>
      </section>

      {/* Empty & Error States */}
      <section className="space-y-4">
        <h2 className="text-h2 text-[var(--color-text)]">Empty & Error States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmptyState
            title="Your bag is empty"
            description="Explore our handmade collection to find your favorite accessories."
            actionLabel="Browse Catalogue"
            onAction={() => alert('Browse clicked')}
          />
          <ErrorState
            title="Failed to load items"
            message="We could not connect to the boutique service. Please try again."
            onRetry={() => alert('Retry clicked')}
          />
        </div>
      </section>
    </div>
  );
}

export default function ComponentPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <ToastProvider>
      <PreviewContent />
    </ToastProvider>
  );
}
