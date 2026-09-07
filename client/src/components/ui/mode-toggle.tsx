import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
export function ModeToggle() {
    const { theme, setTheme } = useTheme();
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            <Sun className="size-4	scale-100	dark:scale-0	transition-transform" />
            <Moon className="absolute	size-4	scale-0	dark:scale-100	transition-transform" />
        </Button>
    );
}