export function AppFooter() {
  return (
    <footer className="py-6 px-4 md:px-8 border-t border-border bg-card mt-auto">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Global Stop. All rights reserved.</p>
        <p>An interactive word game for everyone.</p>
      </div>
    </footer>
  );
}
