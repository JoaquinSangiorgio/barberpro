export default function AgendaGoogle() {
  return (
    <div className="h-[80vh] w-full">
      <iframe
        src="https://calendar.google.com/calendar/embed?src=frosty.sangiorgio%40gmail.com&ctz=America%2FArgentina%2FBuenos_Aires"
        style={{ border: 0 }}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
      />
    </div>
  );
}
