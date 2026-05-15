import { motion } from 'framer-motion';
import styled from 'styled-components';
import { colors, fonts, shadows, surfaces } from '../styles/designTokens';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.midnightAbyss};
  overflow: hidden;
  font-family: ${fonts.body};
`;

const TwilightGlow = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(0deg, rgba(216, 236, 248, 0.06) 0%, rgba(152, 192, 239, 0.03) 100%);
`;

const Panel = styled(motion.div)`
  position: relative;
  z-index: 1;
  max-width: 520px;
  width: calc(100% - 48px);
  padding: 40px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid ${surfaces.glassBorder};
  border-radius: 0;
  box-shadow: ${shadows.login};
`;

const Title = styled.h1`
  margin: 0 0 var(--spacing-20);
  font-family: ${fonts.body};
  font-size: var(--text-heading-lg);
  font-weight: 500;
  line-height: 1.2;
  color: ${colors.ghostWhite};
  letter-spacing: -0.02em;
`;

const IntroCopy = styled.p`
  margin: 0 0 var(--spacing-32);
  font-size: var(--text-body-md);
  line-height: 1.4;
  color: ${colors.comet};
  letter-spacing: -0.01em;
`;

const EnterButton = styled(motion.button)`
  padding: 12px 22px;
  font-family: ${fonts.body};
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: ${colors.arcticMist};
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid ${surfaces.glassBorder};
  border-radius: 0;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: ${colors.comet};
    border-color: rgba(186, 215, 247, 0.28);
  }
`;

const IntroScreen = ({ onEnter }) => (
  <Overlay initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: 'easeInOut' }}>
    <TwilightGlow />
    <Panel initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Title>NYT News Observatory</Title>
      <IntroCopy>
        The NYT News Observatory maps the last twenty-four hours of the New York Times into a
        navigable night sky, where each point of light is a single article drawn from the paper&apos;s
        live feeds. The visualization runs in the browser with React and Three.js: article metadata
        arrives through NYT APIs, and each star is a procedural sprite tinted by its section and
        animated to suggest how recently it was published. I built it as a way to see the shape of
        the day&apos;s news at a glance rather than as a chronological list. To explore, drag to orbit
        the field and scroll to zoom; pause over a star to read its headline, and click to open a
        summary with a link to the full story. Use the section filters along the top to narrow the
        sky, and press Escape to close any open panel.
      </IntroCopy>
      <EnterButton type="button" onClick={onEnter} whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
        Enter observatory
      </EnterButton>
    </Panel>
  </Overlay>
);

export default IntroScreen;
