import { useState } from 'react';
import { ThemeToggle } from '@/components/theme';
import {
  Button,
  Badge,
  Avatar,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  DatePicker,
  FileUpload,
  Tooltip,
  ProgressBar,
} from '@/components/ui';

export default function ComponentsShowcasePage() {
  const [checked, setChecked] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState('');
  const [progress, setProgress] = useState(45);

  return (
    <div className="min-h-screen bg-bg text-primary">
      <ThemeToggle />
      
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Components Showcase</h1>
          <p className="text-secondary">All reusable UI components in one place</p>
        </div>

        <div className="space-y-12">
          <section className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Badges</h2>
            <div className="flex flex-wrap gap-3 items-center">
              <Badge>Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge size="sm">Small</Badge>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Avatars</h2>
            <div className="flex flex-wrap gap-6 items-end">
              <Avatar name="John Doe" size="sm" />
              <Avatar name="Jane Smith" size="md" showStatus statusType="online" />
              <Avatar name="Bob Wilson" size="lg" showStatus statusType="away" />
              <Avatar name="Alice Brown" size="xl" showStatus statusType="online" />
              <Avatar 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
                name="Mike Johnson" 
                size="lg"
                showStatus
                statusType="online"
              />
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Form Elements</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                fullWidth
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                helperText="Must be at least 8 characters"
                fullWidth
              />

              <Input
                label="With Error"
                type="text"
                placeholder="Invalid input"
                error="This field is required"
                fullWidth
              />

              <Select
                label="Country"
                fullWidth
                options={[
                  { value: '', label: 'Select a country' },
                  { value: 'us', label: 'United States' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'ca', label: 'Canada' },
                ]}
              />
            </div>

            <div className="mt-6">
              <Textarea
                label="Description"
                placeholder="Tell us about your project..."
                helperText="Maximum 500 characters"
                fullWidth
              />
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Checkbox & Radio</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3 text-primary">Checkboxes</h3>
                <div className="space-y-2">
                  <Checkbox
                    label="Accept terms and conditions"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                  />
                  <Checkbox label="Subscribe to newsletter" />
                  <Checkbox label="Enable notifications" />
                </div>
              </div>

              <div>
                <RadioGroup
                  label="Select your plan"
                  name="plan"
                  value={selectedRadio}
                  onChange={(e) => setSelectedRadio(e.target.value)}
                  options={[
                    { value: 'free', label: 'Free Plan' },
                    { value: 'pro', label: 'Pro Plan' },
                    { value: 'enterprise', label: 'Enterprise Plan' },
                  ]}
                />
              </div>

              <div>
                <RadioGroup
                  label="Payment method"
                  name="payment"
                  orientation="horizontal"
                  options={[
                    { value: 'card', label: 'Credit Card' },
                    { value: 'paypal', label: 'PayPal' },
                    { value: 'bank', label: 'Bank Transfer' },
                  ]}
                />
              </div>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Date Picker</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <DatePicker
                label="Start Date"
                fullWidth
              />
              <DatePicker
                label="End Date"
                error="End date must be after start date"
                fullWidth
              />
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">File Upload</h2>
            <FileUpload
              label="Upload Documents"
              helperText="PDF, DOC, or DOCX files only"
              acceptedFormats={['.pdf', '.doc', '.docx']}
              maxSize={10 * 1024 * 1024}
              fullWidth
              multiple
            />
          </section>

          <section className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Tooltips</h2>
            <div className="flex flex-wrap gap-6">
              <Tooltip content="This is a tooltip on top" position="top">
                <Button variant="secondary">Hover Top</Button>
              </Tooltip>
              
              <Tooltip content="This is a tooltip on the right" position="right">
                <Button variant="secondary">Hover Right</Button>
              </Tooltip>
              
              <Tooltip content="This is a tooltip on the bottom" position="bottom">
                <Button variant="secondary">Hover Bottom</Button>
              </Tooltip>
              
              <Tooltip content="This is a tooltip on the left" position="left">
                <Button variant="secondary">Hover Left</Button>
              </Tooltip>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Progress Bars</h2>
            
            <div className="space-y-6">
              <ProgressBar value={progress} showLabel label="Upload Progress" />
              
              <div className="flex gap-2 mb-4">
                <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                  -10%
                </Button>
                <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                  +10%
                </Button>
              </div>

              <ProgressBar value={75} variant="success" label="Success" />
              <ProgressBar value={60} variant="warning" label="Warning" />
              <ProgressBar value={30} variant="danger" label="Danger" />
              
              <div className="grid md:grid-cols-3 gap-4">
                <ProgressBar value={85} size="sm" variant="success" />
                <ProgressBar value={60} size="md" variant="warning" />
                <ProgressBar value={40} size="lg" variant="danger" />
              </div>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Combined Example</h2>
            <p className="text-secondary mb-6">
              A real-world example combining multiple components
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar name="Sarah Connor" size="lg" showStatus statusType="online" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-primary">Sarah Connor</h3>
                    <Badge variant="success" size="sm">Premium</Badge>
                  </div>
                  <p className="text-sm text-secondary">sarah@example.com</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  fullWidth
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  fullWidth
                />
              </div>

              <Textarea
                label="Bio"
                placeholder="Tell us about yourself..."
                fullWidth
              />

              <div className="flex gap-3">
                <Button variant="primary">Save Changes</Button>
                <Button variant="secondary">Cancel</Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
