import { ButtonLink } from '@/components/ui/button'
import { markAppTransition, type Application } from '@/lib/app-navigation'

export function AppSwitchLink({ application, onClick, ...props }:
  Omit<React.ComponentProps<typeof ButtonLink>, 'href'> & { application: Application }) {
  return <ButtonLink {...props}
    href={application === 'latih' ? `${import.meta.env.BASE_URL}latih/` : import.meta.env.BASE_URL}
    onClick={event => {
      onClick?.(event)
      if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && props.target !== '_blank') {
        markAppTransition(application)
      }
    }} />
}
