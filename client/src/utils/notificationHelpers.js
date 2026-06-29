export function isCvRejectedNotification(noti) {
  const title = (noti?.title || '').toLowerCase();
  return title.includes('cv rejected') || title.includes('rejected cv');
}
