// TEMPLATE - scaffolded by the umbrage-prototype skill, not yet published to a real Figma file.
//
// Copy this into `libs/ui-components/src/lib/badge/badge.figma.tsx` in an engagement's cloned
// prototype repo (never into the shared nestjs-react-starter starter kit) the first time that
// engagement sets up Code Connect. See `references/figma-sync.md` for the discovery and publish
// steps that fill in the node ID below and push this to Figma.
//
// STATUS: this mapping matches Badge's actual props as of this writing (size, color, icon,
// iconPosition, text - see libs/ui-components/src/lib/badge/badge.tsx), but REPLACE_NODE_ID has
// never been resolved against a real Figma file and `npx @figma/code-connect publish` has never
// been run for it. Run the discovery command in figma-sync.md against your client's duplicated
// V2.2 file to get the real node ID before publishing.
//
// Use this file as the reference structure for mapping any other component - figma-sync.md points
// here from its "Adding a new component" section.

import figma from '@figma/code-connect';
import { Badge, BadgeColor, BadgeSize, BadgeIconPosition } from './badge';

figma.connect(Badge, 'REPLACE_NODE_ID', {
  props: {
    text: figma.string('Text'),
    size: figma.enum('Size', {
      Regular: BadgeSize.Regular,
      Small: BadgeSize.Small,
    }),
    // BadgeColor has no "Error" value - if the Figma component has an "Error" variant, map it to
    // BadgeColor.Alert, don't add a new enum value to match Figma. See SKILL.md's component rules.
    color: figma.enum('Color', {
      Information: BadgeColor.Information,
      Success: BadgeColor.Success,
      Warning: BadgeColor.Warning,
      Alert: BadgeColor.Alert,
      Neutral: BadgeColor.Neutral,
    }),
    iconPosition: figma.enum('Icon Position', {
      Leading: BadgeIconPosition.Leading,
      Trailing: BadgeIconPosition.Trailing,
    }),
  },
  example: ({ text, size, color, iconPosition }) => (
    <Badge text={text} size={size} color={color} iconPosition={iconPosition} />
  ),
});
