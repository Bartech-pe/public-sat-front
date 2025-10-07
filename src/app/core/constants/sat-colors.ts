interface TypeSatColors {
  principal: string;
  principalHover: string;
  text: string;
  white: string;
  error: string;
  textInteractive: string;
  contentCard: string;
  background: string;
  contentInfo: string;
  background2: string;
}

export const satColors: TypeSatColors = {
  principal: '#194a84',
  principalHover: '#0f2d51',
  text: '#202022',
  white: '#fefefe',
  error: '#eb4038',
  textInteractive: '#303880',
  contentCard: '#c0f0fe',
  background: '#eff1fe',
  contentInfo: '#f3fffd',
  background2: '#f4f9fc',
};

export function applySatColors(): void {
  const root = document.documentElement;
  Object.entries(satColors).forEach(([key, value]) => {
    root.style.setProperty(`--sat-${key}`, value);
  });
}
