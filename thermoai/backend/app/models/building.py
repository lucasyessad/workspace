from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, Text, JSON, Uuid
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class BuildingProject(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "building_projects"

    organization_id = Column(Uuid, ForeignKey("organizations.id"), nullable=False)
    project_code = Column(String(80))
    name = Column(String(255), nullable=False)
    project_status = Column(String(50), nullable=False, default="active")
    client_reference = Column(String(120))
    primary_manager_user_id = Column(Uuid, ForeignKey("users.id"), nullable=True)

    # Workflow
    workflow_stage = Column(String(50), default="project_created")

    # Extended project settings
    description = Column(Text, nullable=True)
    calculation_method = Column(String(50), default="3CL_DPE_2021")
    climate_zone = Column(String(20), default="H2b")
    contact_name = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="building_projects")
    buildings = relationship("Building", back_populates="project", lazy="dynamic")


class Building(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "buildings"

    organization_id = Column(Uuid, ForeignKey("organizations.id"), nullable=False)
    project_id = Column(Uuid, ForeignKey("building_projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    address_line_1 = Column(String(255))
    address_line_2 = Column(String(255))
    postal_code = Column(String(20))
    city = Column(String(120))
    country_code = Column(String(2), default="FR")
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))
    construction_year = Column(Integer)
    building_type = Column(String(80))       # collectif, individuel, tertiaire
    ownership_type = Column(String(80))      # copropriete, bailleur, collectivite
    heated_area_m2 = Column(Numeric(14, 2))
    floors_above_ground = Column(Integer)
    floors_below_ground = Column(Integer, default=0)
    main_use_type = Column(String(80))       # residentiel, bureaux, mixte
    occupancy_profile = Column(String(80))
    current_energy_label = Column(String(4))  # A à G
    current_ghg_label = Column(String(4))

    project = relationship("BuildingProject", back_populates="buildings")
    systems = relationship("System", back_populates="building", lazy="dynamic")
    envelopes = relationship("Envelope", back_populates="building", lazy="dynamic")
    energy_bills = relationship("EnergyBill", back_populates="building", lazy="dynamic")
    audits = relationship("Audit", back_populates="building", lazy="dynamic")


class System(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "systems"

    building_id = Column(Uuid, ForeignKey("buildings.id"), nullable=False)
    system_type = Column(String(80), nullable=False)   # chauffage, ecs, ventilation, refroidissement
    energy_source = Column(String(80))                  # gaz, fioul, electricite, bois, pac
    brand = Column(String(120))
    model = Column(String(120))
    installation_year = Column(Integer)
    nominal_power_kw = Column(Numeric(14, 3))
    efficiency_nominal = Column(Numeric(8, 4))
    status = Column(String(50), default="active")
    metadata_ = Column("metadata", JSON, default=dict)

    building = relationship("Building", back_populates="systems")


class Envelope(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "envelopes"

    building_id = Column(Uuid, ForeignKey("buildings.id"), nullable=False)
    element_type = Column(String(80), nullable=False)   # mur, toiture, plancher_bas, menuiserie
    orientation = Column(String(20))                     # N, S, E, O, horizontal
    surface_m2 = Column(Numeric(14, 2))
    u_value = Column(Numeric(8, 4))                      # W/m².K
    insulation_type = Column(String(120))
    insulation_thickness_mm = Column(Numeric(10, 2))
    condition_state = Column(String(50))                 # bon, moyen, mauvais
    metadata_ = Column("metadata", JSON, default=dict)

    building = relationship("Building", back_populates="envelopes")


class EnergyBill(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "energy_bills"

    building_id = Column(Uuid, ForeignKey("buildings.id"), nullable=False)
    billing_period_start = Column(String(10), nullable=False)   # ISO date
    billing_period_end = Column(String(10), nullable=False)
    energy_type = Column(String(80), nullable=False)             # gaz, electricite, fioul
    consumption_kwh = Column(Numeric(18, 3))
    cost_eur_ht = Column(Numeric(14, 2))
    cost_eur_ttc = Column(Numeric(14, 2))
    degree_days_base = Column(Numeric(10, 2))
    supplier_name = Column(String(255))
    invoice_reference = Column(String(120))

    building = relationship("Building", back_populates="energy_bills")
