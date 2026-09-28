import type { ReactNode } from "react";

function GuideTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <aside className="guide-tip">
      <span aria-hidden="true">💡</span>
      <div>
        <p className="guide-tip-label"><strong>{label}</strong></p>
        {children}
      </div>
    </aside>
  );
}

export function GuideContent() {
  return (
    <div className="guide-content">

<GuideTip label="Tip #0">
<p>H-1B1 is a special class of the H-1B visa, granted with a cap of 5,400 Singaporeans per year due to a free trade agreement.</p>
<p>We are 4,000 placements away from that cap. So a properly handled visa application is virtually guaranteed to succeed!</p>
</GuideTip>
<h2 id="costs">Understanding H-1B1 visa costs for employers</h2>
<p>If you&#x27;re considering hiring talent through the H-1B1 visa program, one of the first questions you&#x27;ll likely have is about the costs involved. Let&#x27;s break down the fees based on your company&#x27;s size:</p>
<h3>For companies with 25 or fewer employees</h3>
<p>The total cost comes to $1,510, which includes:</p>
<ul>
<li>USCIS I-129 filing fee: $460</li>
<li>USCIS Asylum Program fee: $300</li>
<li>USCIS ACWIA fee: $750</li>
</ul>
<h3>For larger companies (more than 25 employees)</h3>
<p>The total cost ranges from $2,830 to $2,880, depending on your filing method:</p>
<ul>
<li>USCIS I-129 filing fee: $780 (paper) or $730 (online)</li>
<li>USCIS Asylum Program fee: $600</li>
<li>USCIS ACWIA fee: $1,500</li>
</ul>
<p><strong>Note:</strong> When calculating your company size, remember to count full-time equivalent employees, including both full-time workers and part-time workers converted to full-time equivalents. This calculation should include employees across all subsidiaries and affiliates.</p>
<GuideTip label="Tip #1">
<p>You don’t have to pay this USCIS fee! If a Singaporean processes this visa at the U.S. Embassy in Singapore, you can skip the filing fee. The prospective employee only needs to pay the $205 MRV fee and nothing else.</p>
</GuideTip>
<h2 id="timeline">H-1B1 visa processing timeline: a guide for employers</h2>
<p>Understanding the H-1B1 visa processing timeline is crucial for effective workforce planning. Here&#x27;s a comprehensive breakdown of the key timeframes, which should take around one month, starting from LCA approval:</p>
<h3>Key processing times</h3>
<ul>
<li><strong>Labor Condition Application (LCA):</strong> one week of processing time</li>
<li><strong>Visa processing (two options):</strong><ol>
<li><strong>In Singapore via the U.S. Embassy:</strong> Approximately two weeks to secure an interview appointment. The visa decision will be given during the interview itself. There is no delay. Collecting the passport with the visa stamp takes two weeks or less, usually one week.</li>
<li><strong>In the U.S. via USCIS:</strong> Could take up to one month.</li>
</ol></li>
</ul>
<h3>Flexible application timeline</h3>
<p>One of the major advantages of the H-1B1 visa is its flexibility. Unlike regular H-1B visas:</p>
<ul>
<li>You can file petitions at any time during the year; there&#x27;s no April deadline when the H-1B quota renews.</li>
<li>Employees can begin working at any time of the year; you&#x27;re not restricted to an October 1 start date.</li>
<li>The quota for H-1B1 visas is rarely reached, providing nearly 100% certainty in the application process.</li>
</ul>
<p>An approved LCA alone does not authorize employment. The employee must also have immigration status that permits the proposed work, and the applicable employment start date must have arrived. Source: <a href="https://flag.dol.gov/programs/LCA">https://flag.dol.gov/programs/LCA</a> </p>
<GuideTip label="Tip #2">
<p>To minimize processing time, consider using the U.S. consular processing route, which typically takes about two weeks in Singapore versus one month at USCIS.</p>
</GuideTip>
<p><strong>Reminder (standard practice for all visa workers):</strong> On or within 30 days before the date the LCA is filed with ETA, provide notice of the employer&#x27;s intent to hire H-1B, H-1B1, or E-3 workers. The employer must provide this notice to the bargaining representative of workers in the occupation in which the H-1B, H-1B1, or E-3 worker will be employed. If there is no bargaining representative, the employer must post such notices in conspicuous locations at the intended place(s) of employment, or provide them electronically.</p>
<h2 id="documentation">Essential guide: H-1B1 visa documentation</h2>
<p>Getting your H-1B1 visa documentation right is crucial for a successful application. Here&#x27;s everything employers need to know, including some valuable insider tips.</p>
<h3>Required documentation</h3>
<p>The key documents needed for an H-1B1 visa application include:</p>
<ul>
<li><strong>Labor Condition Application (LCA):</strong> Submit Form 9035/9035E</li>
<li><strong>Pre-filing notice:</strong> Must be submitted 30 days before the LCA filing with the Department of Labor, including:<ul>
<li>Indicate that H-1B workers are sought</li>
<li>Identify the number of H-1B employees the employer plans to hire</li>
<li>State the occupational classification of the H-1B employees</li>
<li>State the wages offered (they need to be fair market wages)</li>
<li>State the period of employment</li>
<li>State the locations at which the H-1B employees will work</li>
<li>Where there is no collective bargaining representative, state that the LCAs are available for public inspection at the employer&#x27;s U.S. principal place of business or at the worksite</li>
</ul></li>
<li><strong>Core documentation the employee needs to receive from the employer:</strong><ul>
<li><strong>Approval notice:</strong> (optional if the visa is handled by the U.S. Embassy in Singapore) File Form I-129 to obtain an I-797 H-1B1 approval notice from U.S. Citizenship and Immigration Services (USCIS)</li>
<li><strong>Approved LCA:</strong> Certified Labor Condition Application (LCA) to prove that the company meets the criteria for sponsoring an H-1B1 visa</li>
<li><strong>Employment verification:</strong> A letter that confirms your employment, including your name, position, employment dates, and a brief job description</li>
<li><strong>Passport:</strong> A valid passport with biographical data and an expiration date</li>
</ul></li>
</ul>
<GuideTip label="That’s it!">
<p>This is the simplest visa to obtain ever, thanks to the good legal standing between Singapore and the U.S.</p>
<p>Make sure your candidate has all of these documents before consular processing at the U.S. Embassy in Singapore.</p>
</GuideTip>
    </div>
  );
}
