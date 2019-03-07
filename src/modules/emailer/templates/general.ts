import mjml from "mjml";

export const generalTemplate = (snippet: string) => {
  const template = `
<mjml>
  <mj-head>
    <mj-style>
    </mj-style>
  </mj-head>
  <mj-body background-color="#424242">
    <mj-section background-color="#D6D6D6">
      <mj-column>
        <mj-image src="//via.placeholder.com/350x65" />
        <mj-divider border-width="1px" border-style="solid" border-color="darkgrey" />

        ${snippet}
      </mj-column>
    </mj-section>

    <mj-section padding="10px 0 20px 0">
      <mj-column>
        <mj-text align="center" color="#9B9B9B" font-size="11px">
        Company info can go here</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;
  return mjml(template);
};
