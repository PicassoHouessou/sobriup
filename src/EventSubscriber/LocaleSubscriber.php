<?php

namespace App\EventSubscriber;

use App\Repository\LocaleRepository;
use Carbon\Carbon;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use function Symfony\Component\String\u;

class LocaleSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly UrlGeneratorInterface $urlGenerator,
        /** @var string[] */
        private array                          $enabledLocales,
        private ?string                        $defaultLocale = null,
        private ?string                        $currentLocale = null
    )
    {
        if (empty($this->enabledLocales)) {
            throw new \UnexpectedValueException('The list of supported locales must not be empty.');
        }

        $this->defaultLocale = $defaultLocale ?: $this->enabledLocales[0];

        if (!\in_array($this->defaultLocale, $this->enabledLocales, true)) {
            throw new \UnexpectedValueException(sprintf('The default locale ("%s") must be one of "%s".', $this->defaultLocale, implode(', ', $this->enabledLocales)));
        }

        // Add the default locale at the first position of the array,
        // because Symfony\HttpFoundation\Request::getPreferredLanguage
        // returns the first element when no an appropriate language is found
        array_unshift($this->enabledLocales, $this->defaultLocale);
        $this->enabledLocales = array_unique($this->enabledLocales);
    }

    public static function getSubscribedEvents()
    {
        return array(
            KernelEvents::REQUEST => array(array('onKernelRequest', 200)),
            KernelEvents::RESPONSE => array('setContentLanguage')
        );
    }

    public function onKernelRequest(RequestEvent $event)
    {
        // Persist DefaultLocale in translation table
        //$this->translatableListener->setPersistDefaultLocaleTranslation(true);

        /** @var Request $request */
        $request = $event->getRequest();
        if ($request->headers->has("X-LOCALE")) {
            $locale = $request->headers->get('X-LOCALE');
            if (in_array($locale, $this->enabledLocales)) {
                $request->setLocale($locale);
            } else {
                $request->setLocale($this->defaultLocale);
            }
        } else {
            $request->setLocale($this->defaultLocale);
        }
        // Set currentLocale
        //$this->translatableListener->setTranslatableLocale($request->getLocale());
        $this->currentLocale = $request->getLocale();

        //Init Carbon locale
        Carbon::setLocale($this->currentLocale);

        // Ignore sub-requests and all URLs but the homepage
        if (!$event->isMainRequest() || '/' !== $request->getPathInfo()) {
            return;
        }
        // Ignore requests from referrers with the same HTTP host in order to prevent
        // changing language for users who possibly already selected it for this application.
        $referrer = $request->headers->get('referer');
        if (null !== $referrer && u($referrer)->ignoreCase()->startsWith($request->getSchemeAndHttpHost())) {
            return;
        }

        $preferredLanguage = $request->getPreferredLanguage($this->enabledLocales);

        //Init Carbon locale
        Carbon::setLocale($preferredLanguage);
        /*
                if ($preferredLanguage !== $this->defaultLocale) {
                    $response = new RedirectResponse($this->urlGenerator->generate('/', ['_locale' => $preferredLanguage]));
                    $event->setResponse($response);
                }
        */

    }

    public function setContentLanguage(ResponseEvent $event): Response
    {
        $response = $event->getResponse();
        $response->headers->add(array('Content-Language' => $this->currentLocale));

        return $response;
    }
}
