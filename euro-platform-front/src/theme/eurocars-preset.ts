import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

// Brand palette: "Light Steel" -- a light-to-dark neutral grey ramp (Bootstrap's own
// gray-100..900 stops) plus a single contrasting accent, #00b4d8, used for buttons/links.
// Page background sits on the light end of the ramp, navbar/footer on the dark end.
export const EuroCarsPreset = definePreset(Aura, {
  semantic: {
    // Drives padding/font-size for every "small"-sized input, select, and button
    // (navbar search + Sign In, Auctions dropdowns, footer email + Subscribe) --
    // Aura's own sm padding (6px/10px) reads too bulky for this layout.
    formField: {
      sm: {
        fontSize: '0.8125rem',
        paddingX: '0.5rem',
        paddingY: '0.25rem',
      },
    },
    // Select dropdown options -- padding only, since this token has no font-size hook
    // (that's set globally in styles.css against .p-select-option instead).
    list: {
      option: {
        padding: '0.375rem 0.75rem',
      },
    },
    primary: {
      50: '{cyan.50}',
      100: '{cyan.100}',
      200: '{cyan.200}',
      300: '{cyan.300}',
      400: '{cyan.400}',
      500: '{cyan.500}',
      600: '#00b4d8',
      700: '{cyan.700}',
      800: '{cyan.800}',
      900: '{cyan.900}',
      950: '{cyan.950}',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1d20',
          950: '#101214',
        },
        primary: {
          color: '{primary.600}',
          // #00b4d8 is bright enough that white text on it reads washed-out -- dark
          // text gives far better contrast than the usual white-on-accent button.
          contrastColor: '#212529',
          hoverColor: '#0093b0',
          activeColor: '#00748a',
        },
        text: {
          color: '#212529',
          hoverColor: '#212529',
          mutedColor: '#6c757d',
          hoverMutedColor: '#212529',
        },
      },
      // The site never actually toggles to light mode (app-dark is always on -- see
      // index.html) -- this is the color scheme every component really renders with.
      // Reuses the same surface ramp as `light` above (it's one fixed grayscale palette,
      // only which end each component treats as "background" differs by mode).
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1d20',
          950: '#101214',
        },
        primary: {
          color: '{primary.600}',
          contrastColor: '#212529',
          hoverColor: '#0093b0',
          activeColor: '#00748a',
        },
        text: {
          color: '{surface.0}',
          hoverColor: '{surface.0}',
          mutedColor: '{surface.400}',
          hoverMutedColor: '{surface.300}',
        },
        formField: {
          background: '{surface.900}',
          disabledBackground: '{surface.700}',
          filledBackground: '{surface.800}',
          filledHoverBackground: '{surface.800}',
          filledFocusBackground: '{surface.800}',
          borderColor: '{surface.600}',
          hoverBorderColor: '{surface.500}',
          focusBorderColor: '{primary.color}',
          invalidBorderColor: '{red.400}',
          color: '{surface.0}',
          disabledColor: '{surface.500}',
          placeholderColor: '{surface.400}',
          invalidPlaceholderColor: '{red.300}',
          floatLabelColor: '{surface.400}',
          floatLabelFocusColor: '{primary.color}',
          floatLabelActiveColor: '{surface.400}',
          iconColor: '{surface.400}',
        },
        content: {
          background: '{surface.800}',
          hoverBackground: '{surface.700}',
          borderColor: '{surface.600}',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
        },
        overlay: {
          select: { background: '{surface.800}', borderColor: '{surface.600}', color: '{text.color}' },
          popover: { background: '{surface.800}', borderColor: '{surface.600}', color: '{text.color}' },
          modal: { background: '{surface.800}', borderColor: '{surface.600}', color: '{text.color}' },
        },
        list: {
          option: {
            focusBackground: '{surface.700}',
            selectedBackground: 'color-mix(in srgb, {primary.color}, transparent 84%)',
            selectedFocusBackground: 'color-mix(in srgb, {primary.color}, transparent 76%)',
            color: '{text.color}',
            focusColor: '{text.hover.color}',
            selectedColor: '{text.color}',
            selectedFocusColor: '{text.color}',
            icon: { color: '{surface.500}', focusColor: '{surface.400}' },
          },
          optionGroup: { background: 'transparent', color: '{text.muted.color}' },
        },
        highlight: {
          background: 'color-mix(in srgb, {primary.color}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.color}, transparent 76%)',
          color: '{text.color}',
          focusColor: '{text.color}',
        },
      },
    },
  },
});
