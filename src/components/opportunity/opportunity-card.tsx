import { CalendarClock, Globe2, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Locale } from '@/lib/i18n/routing';
import { daysUntil, deadlineTone, type DeadlineTone } from '@/lib/opportunity/deadline';
import type { OpportunityListItem } from '@/lib/opportunity/search';
import { typeTone } from '@/lib/opportunity/type-color';
import { cn } from '@/lib/utils';

const DEADLINE_VARIANT: Record<DeadlineTone, 'urgent' | 'soon' | 'warning' | 'far' | 'closed'> = {
  urgent: 'urgent',
  soon: 'soon',
  warning: 'warning',
  far: 'far',
  closed: 'closed',
};

function formatDeadline(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

/** Location line: remote first, otherwise city and country. */
function locationLabel(item: OpportunityListItem, t: ReturnType<typeof useTranslations>) {
  if (item.isRemote) return t('remoteLabel');
  if (item.isHybrid) return `${t('hybridLabel')} · ${item.city ?? item.country ?? ''}`.trim();
  return [item.city, item.country].filter(Boolean).join(', ');
}

export function OpportunityCard({
  item,
  locale,
  today = new Date(),
}: {
  item: OpportunityListItem;
  locale: Locale;
  today?: Date;
}) {
  const t = useTranslations('pages.explore');
  const tTypes = useTranslations('types');

  const deadline = item.deadlineDate ? new Date(`${item.deadlineDate}T00:00:00Z`) : null;
  const tone = deadline ? deadlineTone(daysUntil(deadline, today)) : null;
  const deadlineText = deadline ? formatDeadline(item.deadlineDate!, locale) : null;
  const location = locationLabel(item, t);

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={typeTone(item.type)}>{tTypes(item.type)}</Badge>
          {item.isDemo ? (
            <Badge variant="outline" size="sm">
              {t('demoBadge')}
            </Badge>
          ) : null}
        </div>

        <CardTitle className="text-pretty">{item.title}</CardTitle>

        {item.organizationName ? (
          <p className="text-sm font-semibold text-muted-foreground">{item.organizationName}</p>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {item.shortSummary ? (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {item.shortSummary}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            {item.isRemote ? (
              <Globe2 aria-hidden="true" className="size-4" strokeWidth={1.75} />
            ) : (
              <MapPin aria-hidden="true" className="size-4" strokeWidth={1.75} />
            )}
            <span className={cn(!location && 'sr-only')}>{location || t('locationUnknown')}</span>
          </span>

          <span className="inline-flex items-center gap-1.5">
            <CalendarClock aria-hidden="true" className="size-4" strokeWidth={1.75} />
            <span className="sr-only">{t('deadlineLabel')}</span>
            {tone && deadlineText ? (
              <Badge variant={DEADLINE_VARIANT[tone]} size="sm">
                {deadlineText}
              </Badge>
            ) : (
              <Badge variant="outline" size="sm">
                {item.deadlineType === 'rolling' ? t('rollingLabel') : t('unknownDeadline')}
              </Badge>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
