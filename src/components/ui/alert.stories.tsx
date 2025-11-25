import { type Meta, type StoryObj } from "@storybook/react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <Alert>
      <AlertDescription>
        This is an alert without a title. It can be used for simple notifications.
      </AlertDescription>
    </Alert>
  ),
};

export const Examples: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Update available</AlertTitle>
        <AlertDescription>
          A new software update is available. Would you like to download and install it now?
        </AlertDescription>
      </Alert>
      
      <Alert variant="destructive">
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>
          We couldn't process your payment. Please check your payment details and try again.
        </AlertDescription>
      </Alert>
      
      <Alert>
        <AlertTitle>Pro tip</AlertTitle>
        <AlertDescription>
          You can use keyboard shortcuts to navigate through the application more quickly.
          Press <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded">?</kbd> to see all available shortcuts.
        </AlertDescription>
      </Alert>
    </div>
  ),
};
