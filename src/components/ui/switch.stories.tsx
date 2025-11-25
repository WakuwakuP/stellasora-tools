import { type Meta, type StoryObj } from "@storybook/react";
import { Switch } from "./switch";
import { Label } from "./label";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode" className="cursor-pointer">
        Airplane Mode
      </Label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="disabled-off" disabled />
        <Label htmlFor="disabled-off" className="opacity-50">
          Disabled (Off)
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled-on" disabled defaultChecked />
        <Label htmlFor="disabled-on" className="opacity-50">
          Disabled (On)
        </Label>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-sm">
      <div className="space-y-0.5">
        <Label htmlFor="notifications" className="text-base">
          Notifications
        </Label>
        <p className="text-sm text-muted-foreground">
          Receive notifications about your account activity.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="notifications" defaultChecked />
        <Label htmlFor="notifications" className="cursor-pointer">
          Enable notifications
        </Label>
      </div>
    </div>
  ),
};

export const SettingsList: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <h3 className="text-lg font-medium">Privacy Settings</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="public-profile" className="cursor-pointer">
            Public profile
          </Label>
          <Switch id="public-profile" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-email" className="cursor-pointer">
            Show email address
          </Label>
          <Switch id="show-email" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="marketing" className="cursor-pointer">
            Marketing emails
          </Label>
          <Switch id="marketing" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="analytics" className="cursor-pointer">
            Share analytics data
          </Label>
          <Switch id="analytics" />
        </div>
      </div>
    </div>
  ),
};
