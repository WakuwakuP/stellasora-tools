import { type Meta, type StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms" className="cursor-pointer">
        I agree to the terms and conditions
      </Label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-unchecked" disabled />
        <Label htmlFor="disabled-unchecked" className="opacity-50">
          Disabled unchecked
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled checked />
        <Label htmlFor="disabled-checked" className="opacity-50">
          Disabled checked
        </Label>
      </div>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Select your preferences</h3>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="notifications" />
          <Label htmlFor="notifications" className="cursor-pointer">
            Email notifications
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="marketing" />
          <Label htmlFor="marketing" className="cursor-pointer">
            Marketing emails
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="updates" />
          <Label htmlFor="updates" className="cursor-pointer">
            Product updates
          </Label>
        </div>
      </div>
    </div>
  ),
};
