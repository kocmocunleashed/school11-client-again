import { AlumniReunion } from "@/components/site/alumni-reunion";
import { AnniversaryPlan } from "@/components/site/anniversary-plan";
import { AnniversaryMemories, AnniversaryPortraits } from "@/components/site/anniversary-stories";
import { HomeContent } from "@/components/site/home-content";
import { SitePage } from "@/components/site/site-page";

export default function Page() {
  return (
    <SitePage page="home">
      <HomeContent>
        <AnniversaryPortraits />
        <AnniversaryPlan />
        <AlumniReunion />
        <AnniversaryMemories />
      </HomeContent>
    </SitePage>
  );
}
