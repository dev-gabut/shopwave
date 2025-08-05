'use client';
import Link from 'next/link';
import { Search, Waves, LogOut, User as UserIcon, Shield, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartIcon } from '@/components/cart-icon';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
	const { user, signout } = useAuth();

	return (
		<header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
				<div className="flex items-center space-x-4">
					<Link
						href="/"
						className="flex items-center space-x-2"
					>
						<Waves className="h-7 w-7 text-primary" />
						<span className="text-2xl font-bold font-headline text-primary">ShopWave</span>
					</Link>
				</div>

				<div className="flex items-center space-x-4">
					<Button
						asChild
						variant="ghost"
						size="icon"
					>
						<Link href="/search">
							<Search className="h-6 w-6" />
							<span className="sr-only">Search products</span>
						</Link>
					</Button>
					<CartIcon />
					{user && user.role === 'BUYER' && (
						<Button
							asChild
							variant="outline"
						>
							<Link href="/seller/form_seller">Sell</Link>
						</Button>
					)}
					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full"
								>
									<Avatar className="h-8 w-8">
										{user.imageUrl ? (
											<Image
												src={user.imageUrl}
												alt="User Avatar"
												width={32}
												height={32}
												className="rounded-full"
											/>
										) : (
											<UserIcon className="h-6 w-6" />
										)}
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-56"
								align="end"
								forceMount
							>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">My Account</p>
										<p className="text-xs leading-none text-muted-foreground">{user.email}</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Link
										className="flex"
										href="/account"
									>
										<UserIcon className="mr-2 h-4 w-4" />
										<span>Account Settings</span>
									</Link>
								</DropdownMenuItem>
								{user.role === 'SELLER' && (
									<DropdownMenuItem>
										<Link
											className="flex"
											href="/seller"
										>
											<Store className="mr-2 h-4 w-4" />
											<span>Seller Panel</span>
										</Link>
									</DropdownMenuItem>
								)}
								{user.role === 'ADMIN' && (
									<DropdownMenuItem>
										<Link
											className="flex"
											href="/admin"
										>
											<Shield className="mr-2 h-4 w-4" />
											<span>Admin Panel</span>
										</Link>
									</DropdownMenuItem>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={signout}>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Sign out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild>
							<Link href="/signin">Sign In</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
