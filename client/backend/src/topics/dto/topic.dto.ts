export class TopicDto {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  subscribers: number;
  hot: boolean;
  isSubscribed: boolean;
}
