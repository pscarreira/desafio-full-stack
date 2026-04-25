import MenuHeader from '@/components/menu-header';

export default function PrivateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-background">
			<MenuHeader className="mb-1" />
			{children}
		</div>
	);
}
