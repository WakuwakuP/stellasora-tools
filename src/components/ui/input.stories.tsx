import { type Meta, type StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="search" placeholder="Search input" />
      <Input type="tel" placeholder="Tel input" />
      <Input type="url" placeholder="URL input" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <Input placeholder="Default" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Read only" readOnly value="Read only text" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      <label htmlFor="email" className="text-sm font-medium">
        Email
      </label>
      <Input id="email" type="email" placeholder="example@email.com" />
    </div>
  ),
};
