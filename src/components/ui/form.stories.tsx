import {type Meta, type StoryObj} from "@storybook/react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import {Input} from "./input";
import {Button} from "./button";
import {Textarea} from "./textarea";
import {Checkbox} from "./checkbox";

const meta: Meta<typeof Form> = {
  title: "UI/Form",
  component: Form,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Form>;

const formSchema = z.object({
  username: z.string().min(2, {
    message: "ユーザー名は2文字以上で入力してください。",
  }),
  email: z.string().email({
    message: "有効なメールアドレスを入力してください。",
  }),
  bio: z.string().max(160, {
    message: "自己紹介は160文字以内で入力してください。",
  }),
  terms: z.boolean().refine((value) => value, {
    message: "利用規約に同意する必要があります。",
  }),
});

function FormExample() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
      terms: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    alert("フォームが送信されました！開発者ツールのコンソールを確認してください。");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ユーザー名</FormLabel>
              <FormControl>
                <Input placeholder="ユーザー名を入力" {...field} />
              </FormControl>
              <FormDescription>
                表示名として使用されます。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormDescription>
                通知の送信に使用されます。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>自己紹介</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="自己紹介を入力してください"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                あなたの簡単な紹介を書いてください（最大160文字）。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  利用規約に同意する
                </FormLabel>
                <FormDescription>
                  サービスの利用規約とプライバシーポリシーに同意します。
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          アカウントを作成
        </Button>
      </form>
    </Form>
  );
}

export const Default: Story = {
  render: () => <FormExample />,
};

// シンプルなフォーム例
function SimpleForm() {
  const form = useForm({
    defaultValues: {
      name: "",
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-4 max-w-md">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input placeholder="名前を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">送信</Button>
      </form>
    </Form>
  );
}

export const Simple: Story = {
  render: () => <SimpleForm />,
};