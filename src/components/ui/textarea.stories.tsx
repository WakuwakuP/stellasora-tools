import { type Meta, type StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";
import { Label } from "./label";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Type your message here.",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea placeholder="Type your message here." id="message" />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: "This is a textarea with default content.\n\nIt can have multiple lines.",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "This textarea is disabled",
    disabled: true,
  },
};

export const WithHint: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="bio">Bio</Label>
      <Textarea
        placeholder="Tell us a little bit about yourself"
        id="bio"
        className="resize-none"
        rows={4}
      />
      <p className="text-sm text-muted-foreground">
        Your bio will be displayed on your public profile.
      </p>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <Label>Small (3 rows)</Label>
        <Textarea placeholder="Small textarea" rows={3} className="mt-1" />
      </div>
      <div>
        <Label>Medium (5 rows)</Label>
        <Textarea placeholder="Medium textarea" rows={5} className="mt-1" />
      </div>
      <div>
        <Label>Large (8 rows)</Label>
        <Textarea placeholder="Large textarea" rows={8} className="mt-1" />
      </div>
    </div>
  ),
};
