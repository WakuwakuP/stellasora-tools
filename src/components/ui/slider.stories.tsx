import { type Meta, type StoryObj } from "@storybook/react";
import { Slider } from "./slider";
import { useState } from "react";
import { Label } from "./label";

const meta: Meta<typeof Slider> = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
  },
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
  },
};

const SliderWithValue = () => {
  const [value, setValue] = useState([50]);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between">
        <Label>Volume</Label>
        <span className="text-sm text-muted-foreground">{value[0]}%</span>
      </div>
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        step={1}
      />
    </div>
  );
};

export const WithValue: Story = {
  render: () => <SliderWithValue />,
};

export const Steps: Story = {
  render: () => (
    <div className="space-y-6 w-full">
      <div>
        <Label>Step: 1</Label>
        <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
      </div>
      <div>
        <Label>Step: 10</Label>
        <Slider defaultValue={[50]} max={100} step={10} className="mt-2" />
      </div>
      <div>
        <Label>Step: 25</Label>
        <Slider defaultValue={[50]} max={100} step={25} className="mt-2" />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    disabled: true,
  },
};

const PriceRangeSlider = () => {
  const [priceRange, setPriceRange] = useState([20, 80]);

  return (
    <div className="w-full space-y-4">
      <div>
        <Label>Price Range</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Select your budget range
        </p>
      </div>
      <Slider
        value={priceRange}
        onValueChange={setPriceRange}
        max={200}
        step={10}
      />
      <div className="flex justify-between text-sm">
        <span>${priceRange[0]}</span>
        <span>${priceRange[1]}</span>
      </div>
    </div>
  );
};

export const PriceRange: Story = {
  render: () => <PriceRangeSlider />,
};

export const CustomColors: Story = {
  render: () => (
    <div className="space-y-6 w-full">
      <div>
        <Label>Temperature (Cold to Hot)</Label>
        <Slider
          defaultValue={[30]}
          max={100}
          step={1}
          className="mt-2 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-blue-500 [&_[role=slider]]:to-red-500"
        />
      </div>
      <div>
        <Label>Success Rate</Label>
        <Slider
          defaultValue={[75]}
          max={100}
          step={1}
          className="mt-2 [&_[role=slider]]:bg-green-500"
        />
      </div>
    </div>
  ),
};
