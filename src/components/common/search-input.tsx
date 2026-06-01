import type * as React from "react";

import { Search } from "lucide-react";
import { forwardRef } from "react";

import { Input } from "@/components/ui/input";

export const SearchInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <div className="relative" role="search">
    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input ref={ref} className="pl-11" {...props} />
  </div>
));

SearchInput.displayName = "SearchInput";
