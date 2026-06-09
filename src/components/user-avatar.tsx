import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

/** Avatar that shows the user's image when present, otherwise their initials. */
export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const label = name ?? "";
  return (
    <Avatar className={className}>
      {image && <AvatarImage src={image} alt={label} />}
      <AvatarFallback>{label ? initials(label) : "?"}</AvatarFallback>
    </Avatar>
  );
}
