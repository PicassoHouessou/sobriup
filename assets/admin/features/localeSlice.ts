import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@Admin/store/store';
import { defaultLocale, Locale } from '@Admin/constants/language';

// Define the initial state as an object with a `locale` property
interface LocaleState {
    locale: Locale;
}

const initialState: LocaleState = {
    locale: defaultLocale,
};

export const localeSlice = createSlice({
    name: 'locale',
    initialState,
    reducers: {
        setLocale: (state, action: PayloadAction<Locale>) => {
            state.locale = action.payload;
        },
    },
});

export const { setLocale } = localeSlice.actions;

export default localeSlice.reducer;

// Selector to get the current locale
export const selectCurrentLocale = (state: RootState): Locale => state.locale.locale;
