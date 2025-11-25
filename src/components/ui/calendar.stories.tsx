import {type Meta, type StoryObj} from "@storybook/react";
import {useState} from "react";
import {type DateRange} from "react-day-picker";
import {Calendar} from "./calendar";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./card";

const meta: Meta<typeof Calendar> = {
  title: "UI/Calendar",
  component: Calendar,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(new Date());

    return (
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
      />
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date[]>([]);

    return (
      <Calendar
        mode="multiple"
        selected={selected}
        onSelect={(dates) => setSelected(dates || [])}
      />
    );
  },
};

export const Range: Story = {
  render: () => {
    const [selected, setSelected] = useState<DateRange | undefined>();

    return (
      <Calendar
        mode="range"
        selected={selected}
        onSelect={(range) => setSelected(range)}
        numberOfMonths={2}
      />
    );
  },
};

export const WithCard: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(new Date());

    return (
      <Card className="w-fit">
        <CardHeader>
          <CardTitle>日付を選択</CardTitle>
          <CardDescription>
            イベントの日付を選択してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
          />
          {selected && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
              <p className="text-sm">
                選択された日付: {selected.toLocaleDateString("ja-JP")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(new Date());

    return (
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
      />
    );
  },
};