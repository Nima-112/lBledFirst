package ma.lbledfirst.backend.seed;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.Region;
import ma.lbledfirst.backend.domain.RegionName;
import ma.lbledfirst.backend.repository.RegionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RegionSeeder implements CommandLineRunner {

    private final RegionRepository regionRepository;

    @Override
    public void run(String... args) {
        if (regionRepository.count() == 0) {
            List<Region> regions = List.of(
                    Region.builder().name(RegionName.TANGER_TETOUAN_AL_HOCEIMA).latitude(new BigDecimal("35.7595")).longitude(new BigDecimal("-5.8340")).build(),
                    Region.builder().name(RegionName.LORIENTAL).latitude(new BigDecimal("34.6800")).longitude(new BigDecimal("-1.9100")).build(),
                    Region.builder().name(RegionName.FES_MEKNES).latitude(new BigDecimal("34.0331")).longitude(new BigDecimal("-5.0003")).build(),
                    Region.builder().name(RegionName.RABAT_SALE_KENITRA).latitude(new BigDecimal("34.0209")).longitude(new BigDecimal("-6.8416")).build(),
                    Region.builder().name(RegionName.BENI_MELLAL_KHENIFRA).latitude(new BigDecimal("32.3373")).longitude(new BigDecimal("-6.3498")).build(),
                    Region.builder().name(RegionName.CASABLANCA_SETTAT).latitude(new BigDecimal("33.5731")).longitude(new BigDecimal("-7.5898")).build(),
                    Region.builder().name(RegionName.MARRAKECH_SAFI).latitude(new BigDecimal("31.6295")).longitude(new BigDecimal("-8.0000")).build(),
                    Region.builder().name(RegionName.DRAA_TAFILALET).latitude(new BigDecimal("31.9314")).longitude(new BigDecimal("-4.4247")).build(),
                    Region.builder().name(RegionName.SOUSS_MASSA).latitude(new BigDecimal("30.4278")).longitude(new BigDecimal("-9.5981")).build(),
                    Region.builder().name(RegionName.GUELMIM_OUED_NOUN).latitude(new BigDecimal("28.9870")).longitude(new BigDecimal("-10.0604")).build(),
                    Region.builder().name(RegionName.LAAYOUNE_SAKIA_EL_HAMRA).latitude(new BigDecimal("27.1500")).longitude(new BigDecimal("-13.2000")).build(),
                    Region.builder().name(RegionName.DAKHLA_OUED_ED_DAHAB).latitude(new BigDecimal("23.6848")).longitude(new BigDecimal("-15.9570")).build()
            );
            regionRepository.saveAll(regions);
        }
    }
}