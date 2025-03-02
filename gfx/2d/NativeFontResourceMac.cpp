/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "NativeFontResourceMac.h"
#include "UnscaledFontMac.h"
#include "Types.h"

#include "mozilla/RefPtr.h"
#include "mozilla/gfx/Logging.h"

#ifdef MOZ_WIDGET_UIKIT
#include <CoreFoundation/CoreFoundation.h>
#endif

#include "nsCocoaFeatures.h"

namespace mozilla {
namespace gfx {

/* static */
already_AddRefed<NativeFontResourceMac>
NativeFontResourceMac::Create(uint8_t *aFontData, uint32_t aDataLength)
{
  // copy font data
  CFDataRef data = CFDataCreate(kCFAllocatorDefault, aFontData, aDataLength);
  if (!data) {
    return nullptr;
  }

  // create a provider
  CGDataProviderRef provider = CGDataProviderCreateWithCFData(data);

  // release our reference to the CFData, provider keeps it alive
  CFRelease(data);

  // create the font object
  CGFontRef fontRef = CGFontCreateWithDataProvider(provider);

  // release our reference, font will keep it alive as long as needed
  CGDataProviderRelease(provider);

  if (!fontRef) {
    return nullptr;
  }

  // passes ownership of fontRef to the NativeFontResourceMac instance
  RefPtr<NativeFontResourceMac> fontResource =
    new NativeFontResourceMac(fontRef);

  return fontResource.forget();
}

already_AddRefed<UnscaledFont>
NativeFontResourceMac::CreateUnscaledFont(uint32_t aIndex,
                                          const uint8_t* aInstanceData,
                                          uint32_t aInstanceDataLength)
{
  RefPtr<UnscaledFont> unscaledFont = new UnscaledFontMac(mFontRef);

  return unscaledFont.forget();
}

} // gfx
} // mozilla
