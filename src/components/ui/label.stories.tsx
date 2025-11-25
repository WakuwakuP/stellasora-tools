import { type Meta, type StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Input } from "./input";
import { Checkbox } from "./checkbox";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Label",
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      <Label htmlFor="username">Username</Label>
      <Input id="username" placeholder="Enter username" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms" className="cursor-pointer">
        Accept terms and conditions
      </Label>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      <Label htmlFor="email" className="flex items-center gap-1">
        Email
        <span className="text-red-500">*</span>
      </Label>
      <Input id="email" type="email" placeholder="example@email.com" />
    </div>
  ),
};
